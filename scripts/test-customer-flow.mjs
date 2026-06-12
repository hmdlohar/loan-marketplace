import { chromium } from "playwright";
import path from "path";

const BASE = "http://localhost:2554";
const FILES = "/media/hyper2/HYPER/projects/node/adie/files";
const MOBILE = "9876543210";
const OTP = "123456";
const SCREENSHOTS = "/media/hyper2/HYPER/projects/node/adie/loan-marketplace/scripts/flow-screenshots";

const panFile = path.join(FILES, "pan1.jpg");
const aadhaarFile = path.join(FILES, "aadhar1.webp");
const salaryFile = path.join(FILES, "pan2.png");
const bankFile = path.join(FILES, "aadhar2.jpg");

async function snap(page, name) {
  const filePath = path.join(SCREENSHOTS, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: true });
  console.log(`screenshot: ${filePath}`);
}

async function fillIfEmpty(page, label, value) {
  const field = page.getByLabel(label, { exact: false }).first();
  if (await field.isVisible().catch(() => false)) {
    const current = await field.inputValue().catch(() => "");
    if (!current) {
      await field.fill(value);
    }
  }
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "/usr/bin/google-chrome-stable",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];

  page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(`console: ${msg.text()}`);
    }
  });
  page.on("response", async (response) => {
    const url = response.url();
    if (url.includes("/api/documents/") && response.status() >= 400) {
      const body = await response.text().catch(() => "");
      errors.push(`api ${response.status()} ${url}: ${body.slice(0, 300)}`);
    }
  });

  try {
    console.log("1. Landing page");
    await page.goto(BASE, { waitUntil: "networkidle" });
    await snap(page, "01-landing");

    console.log("2. Apply page");
    await page.goto(`${BASE}/app/apply`, { waitUntil: "networkidle" });
    await page.getByText("Personal Loan").first().click();
    await page.getByRole("button", { name: /Continue/i }).click();

    console.log("3. OTP login");
    await page.getByLabel("Mobile number").fill(MOBILE);
    await page.getByRole("button", { name: /Send OTP/i }).click();
    await page.getByLabel(/OTP/i).fill(OTP);
    const verifyBtn = page.getByRole("button", { name: /Verify/i });
    if (await verifyBtn.isVisible().catch(() => false)) {
      await verifyBtn.click();
    } else {
      await page.getByRole("button", { name: /Continue/i }).last().click();
    }
    await page.waitForURL(/\/app\/apply\/documents/, { timeout: 30000 });
    await snap(page, "02-documents");

    console.log("4. Upload documents");
    const uploadLabels = ["PAN card", "Aadhaar", "Salary slip", "Bank statement"];
    const uploadFiles = [panFile, aadhaarFile, salaryFile, bankFile];

    for (let i = 0; i < uploadLabels.length; i++) {
      const label = uploadLabels[i];
      const file = uploadFiles[i];
      const card = page.locator(".MuiCard-root").filter({ hasText: label }).first();
      const uploadResponsePromise = page.waitForResponse(
        (response) => response.url().includes("/api/documents/Upload") && response.request().method() === "POST",
        { timeout: 30000 }
      );
      const [fileChooser] = await Promise.all([
        page.waitForEvent("filechooser"),
        card.getByRole("button", { name: /Upload/i }).click(),
      ]);
      await fileChooser.setFiles(file);
      const uploadResponse = await uploadResponsePromise;
      const uploadBody = await uploadResponse.text();
      console.log(`   API ${uploadResponse.status()} for ${label}: ${uploadBody.slice(0, 200)}`);
      if (uploadResponse.status() >= 400) {
        throw new Error(`Upload API failed for ${label}: ${uploadBody}`);
      }
      const getResponse = await page.waitForResponse(
        (response) => response.url().includes("/api/applications/Get") && response.request().method() === "POST",
        { timeout: 30000 }
      );
      const getBody = await getResponse.text();
      console.log(`   Get after ${label}: ${getBody.slice(0, 400)}`);
      try {
        await card.getByText("Attached").waitFor({ timeout: 30000 });
      } catch (waitErr) {
        const errText = await page.locator(".MuiTypography-root").filter({ hasText: /failed|error|required|valid/i }).allTextContents();
        throw new Error(`${label} upload did not attach. UI errors: ${errText.join(" | ") || "none"}`);
      }
      console.log(`   uploaded ${label}: ${path.basename(file)}`);
    }

    const pageError = await page.locator(".MuiTypography-colorError").first().textContent().catch(() => "");
    if (pageError) {
      throw new Error(`Page error after uploads: ${pageError}`);
    }
    await snap(page, "03-documents-uploaded");

    console.log("5. Continue to form");
    await page.getByRole("button", { name: /Continue to application form/i }).click();
    await page.waitForURL(/\/app\/apply\/form/, { timeout: 30000 });
    await snap(page, "04-form-prefilled");

    console.log("6. Fill remaining form fields");
    await fillIfEmpty(page, "Email", "rahul.test@example.com");
    await fillIfEmpty(page, "Desired Loan Amount", "500000");
    await fillIfEmpty(page, "Loan Tenure", "36");
    await fillIfEmpty(page, "Net Monthly Income", "75000");

    const selectFields = [
      { label: "Gender", option: "Male" },
      { label: "Employment Type", option: "Salaried" },
      { label: "Mode of Salary/Income", option: "Bank Transfer" },
    ];
    for (let i = 0; i < selectFields.length; i++) {
      const field = selectFields[i];
      const combo = page.getByRole("combobox", { name: new RegExp(field.label, "i") }).first();
      if (await combo.isVisible().catch(() => false)) {
        const current = ((await combo.textContent()) || "").trim();
        if (!current) {
          await combo.click();
          await page.getByRole("option", { name: field.option, exact: true }).click();
        }
      }
    }

    await snap(page, "05-form-filled");

    console.log("7. Submit for recommendations");
    await page.getByRole("button", { name: /Find my best products/i }).click();
    await page.waitForURL(/\/app\/apply\/recommendations/, { timeout: 30000 });
    await snap(page, "06-recommendations");

    console.log("8. Select first product");
    await page.getByRole("button", { name: /Select this product/i }).first().click();
    await page.waitForURL(/\/app\/dashboard/, { timeout: 30000 });
    await snap(page, "07-dashboard-complete");

    const dashboardText = await page.textContent("body");
    if (!dashboardText.includes("Submitted") && !dashboardText.includes("Partner assigned") && !dashboardText.includes("My applications")) {
      throw new Error("Dashboard did not show completed application state.");
    }

    console.log("\nFLOW PASSED");
  } catch (err) {
    await snap(page, "error").catch(() => {});
    console.error("\nFLOW FAILED:", err.message);
    if (errors.length) {
      console.error("Browser errors:", errors.slice(0, 10).join("\n"));
    }
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

main();
