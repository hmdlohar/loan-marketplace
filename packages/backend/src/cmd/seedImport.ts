import config from "@root/config";
import { initMongo } from "@lib/initMongo";
import {
  LOAN_PRODUCT,
  getStaticFormFieldKeys,
  normalizeFieldKey,
} from "commonlib";
import BanksService from "@root/api/banks/BanksService";
import ProductsService from "@root/api/products/ProductsService";
import PartnersService from "@root/api/partners/PartnersService";
import { slugifyTitle } from "@root/utils/slugUtil";
import {
  extensionFromImageUrl,
  guessContentType,
  uploadBankLogo,
} from "@root/utils/s3Util";
import fs from "fs";
import path from "path";

type SourceField = {
  key: string;
  label: string;
  type: string;
  section?: string;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    minAge?: number;
    maxAge?: number;
    errorMessage?: string;
  };
};

type SourceProduct = {
  id: string;
  code: string;
  name: string;
  category: string;
  lender: string;
  imageUrl?: string;
  status?: string;
  additionalFields?: SourceField[];
};

const CONTEXT = "SYSTEM";
const DATA_FILE = path.join(__dirname, "../../data/import-products.json");
const LOGO_OVERRIDES_FILE = path.join(__dirname, "../../data/bank-logo-overrides.json");

const LOGO_FETCH_HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

function loadLogoOverrides(): Record<string, string> {
  if (!fs.existsSync(LOGO_OVERRIDES_FILE)) {
    return {};
  }
  const parsed = JSON.parse(fs.readFileSync(LOGO_OVERRIDES_FILE, "utf8"));
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`${LOGO_OVERRIDES_FILE} must be a JSON object.`);
  }
  return parsed as Record<string, string>;
}

async function fetchLogoBuffer(url: string): Promise<{ buffer: Buffer; contentType: string }> {
  const response = await fetch(url, { headers: LOGO_FETCH_HEADERS });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get("content-type") || guessContentType(url);
  return { buffer, contentType };
}

function mapCategoryToLoanType(category: string): LOAN_PRODUCT | null {
  const normalized = category.trim().toLowerCase();
  if (normalized === "personal loan" || normalized === "loans") {
    return LOAN_PRODUCT.PERSONAL_LOAN;
  }
  if (normalized === "business loan") {
    return LOAN_PRODUCT.WORKING_CAPITAL;
  }
  if (normalized === "credit card") {
    return LOAN_PRODUCT.CREDIT_CARD;
  }
  if (normalized === "loan against property") {
    return LOAN_PRODUCT.LAP;
  }
  return null;
}

async function seedImport() {
  await initMongo();

  const partnerId = config.SEED_PARTNER_ID;
  if (!partnerId) {
    throw new Error("Set SEED_PARTNER_ID in environment.");
  }

  await PartnersService.context(CONTEXT).get_Throwable(partnerId);

  if (!fs.existsSync(DATA_FILE)) {
    throw new Error(`Import file not found: ${DATA_FILE}`);
  }

  const sourceProducts = JSON.parse(fs.readFileSync(DATA_FILE, "utf8")) as SourceProduct[];
  if (!Array.isArray(sourceProducts) || !sourceProducts.length) {
    throw new Error("Import file must contain a non-empty JSON array.");
  }

  const logoOverrides = loadLogoOverrides();
  const bankLogoByLender: Record<string, string> = {};
  const allLenders: string[] = [];

  for (let i = 0; i < sourceProducts.length; i++) {
    const item = sourceProducts[i];
    if (!item.lender) {
      continue;
    }
    if (!allLenders.includes(item.lender)) {
      allLenders.push(item.lender);
    }
    if (item.imageUrl && !bankLogoByLender[item.lender]) {
      bankLogoByLender[item.lender] = item.imageUrl;
    }
  }

  allLenders.sort();
  const bankIdByLender: Record<string, string> = {};
  let banksCreated = 0;
  let banksUpdated = 0;
  let logosUploaded = 0;

  for (let i = 0; i < allLenders.length; i++) {
    const lenderName = allLenders[i];
    const remoteLogoUrl = logoOverrides[lenderName] || bankLogoByLender[lenderName] || "";
    let existing = await BanksService.context(CONTEXT).findOne({ Name: lenderName });
    let bankId = existing?._id || "";

    if (existing) {
      bankIdByLender[lenderName] = existing._id;
    } else {
      const bank = await BanksService.context(CONTEXT).create({
        Name: lenderName,
        LogoPath: "",
      });
      bankId = bank._id;
      bankIdByLender[lenderName] = bankId;
      banksCreated = banksCreated + 1;
      existing = bank;
    }

    if (!remoteLogoUrl || !bankId) {
      continue;
    }

    const currentLogoPath = existing.LogoPath || "";
    if (currentLogoPath && currentLogoPath.startsWith("public/lender-logos/")) {
      continue;
    }

    try {
      const extension = extensionFromImageUrl(remoteLogoUrl);
      const { buffer, contentType } = await fetchLogoBuffer(remoteLogoUrl);
      const uploaded = await uploadBankLogo(bankId, buffer, contentType, extension);
      await BanksService.context(CONTEXT).update(bankId, { LogoPath: uploaded.key });
      logosUploaded = logosUploaded + 1;
      banksUpdated = banksUpdated + 1;
      console.log(`Uploaded logo for ${lenderName} → ${uploaded.key}`);
    } catch (ex: any) {
      console.log(`Logo upload failed for ${lenderName}: ${ex.message || ex}`);
    }
  }

  let productsCreated = 0;
  let productsUpdated = 0;
  let productsSkipped = 0;

  for (let i = 0; i < sourceProducts.length; i++) {
    const item = sourceProducts[i];
    const loanType = mapCategoryToLoanType(item.category);

    if (!loanType) {
      console.log(`Skip (${item.code}): unmapped category "${item.category}"`);
      productsSkipped = productsSkipped + 1;
      continue;
    }

    const bankId = bankIdByLender[item.lender];
    if (!bankId) {
      console.log(`Skip (${item.code}): no bank for lender "${item.lender}"`);
      productsSkipped = productsSkipped + 1;
      continue;
    }

    const content = (item as any).content || {};
    const headline = content.headline || item.name;
    const keyBenefits = Array.isArray(content.keyBenefits) ? content.keyBenefits : [];
    const slug = slugifyTitle(item.name);
    const staticKeys = getStaticFormFieldKeys(loanType);
    const formFields: any[] = [];

    const rawFields = item.additionalFields || [];
    for (let f = 0; f < rawFields.length; f++) {
      const field = rawFields[f];
      if (!field.key || !field.label) {
        continue;
      }
      const normalizedKey = normalizeFieldKey(field.key);
      if (staticKeys.has(normalizedKey)) {
        continue;
      }

      const mapped: any = {
        Key: normalizedKey,
        Label: field.label,
        Type: field.type,
        Required: !!field.required,
      };
      if (field.section) {
        mapped.Section = field.section;
      }
      if (field.placeholder) {
        mapped.Placeholder = field.placeholder;
      }
      if (field.options && field.options.length) {
        mapped.Options = field.options;
      }
      if (field.validation) {
        mapped.Validation = field.validation;
      }
      formFields.push(mapped);
    }

    const existing = await ProductsService.context(CONTEXT).findOne({
      PartnerID: partnerId,
      Slug: slug,
    });

    const productPayload = {
      Title: item.name,
      Slug: slug,
      ShortDescription: headline,
      KeyBenefits: keyBenefits,
      LoanType: loanType,
      BankID: bankId,
      PartnerID: partnerId,
      FormFields: formFields,
    };

    if (existing) {
      await ProductsService.context(CONTEXT).update(existing._id, productPayload);
      productsUpdated = productsUpdated + 1;
      console.log(`Updated product: ${item.name}`);
    } else {
      await ProductsService.context(CONTEXT).create(productPayload);
      productsCreated = productsCreated + 1;
      console.log(`Created product: ${item.name}`);
    }
  }

  console.log("");
  console.log(
    `Banks: ${banksCreated} created, ${banksUpdated} updated, ${logosUploaded} logos uploaded to S3 (${Object.keys(bankIdByLender).length} total lenders)`
  );
  console.log(`Products: ${productsCreated} created, ${productsUpdated} updated, ${productsSkipped} skipped`);
  process.exit(0);
}

seedImport().catch((ex) => {
  console.error(ex.message || ex);
  process.exit(1);
});
