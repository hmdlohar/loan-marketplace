import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import config from "@root/config";

let s3Client: S3Client | null = null;

function assertS3Config() {
  if (!config.AWS_S3_BUCKET) {
    throw new Error("AWS_S3_BUCKET is not configured.");
  }
  if (!config.AWS_ACCESS_KEY_ID || !config.AWS_SECRET_ACCESS_KEY) {
    throw new Error("AWS S3 credentials are not configured.");
  }
  if (config.AWS_S3_BUCKET.includes("idrivee2.com") || config.AWS_S3_BUCKET.startsWith("s3.")) {
    throw new Error(
      "AWS_S3_BUCKET must be your bucket name, not the endpoint URL. Set AWS_S3_ENDPOINT for custom S3 endpoints."
    );
  }
}

export function getS3Client() {
  if (!s3Client) {
    assertS3Config();

    const clientConfig: ConstructorParameters<typeof S3Client>[0] = {
      region: config.AWS_REGION,
      credentials: {
        accessKeyId: config.AWS_ACCESS_KEY_ID,
        secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
      },
    };

    if (config.AWS_S3_ENDPOINT) {
      clientConfig.endpoint = config.AWS_S3_ENDPOINT;
      clientConfig.forcePathStyle = config.AWS_S3_FORCE_PATH_STYLE;
    }

    s3Client = new S3Client(clientConfig);
  }
  return s3Client;
}

export function isPublicS3Key(key: string) {
  return key.startsWith("public/");
}

export function getPartnerLogoPath(partnerId: string) {
  return `public/banks/logos/${partnerId}.png`;
}

export function getBankLogoPath(bankId: string, extension: string) {
  const ext = extension.startsWith(".") ? extension : `.${extension}`;
  return `public/lender-logos/${bankId}${ext}`;
}

export function extensionFromImageUrl(url: string) {
  try {
    const pathname = new URL(url).pathname.toLowerCase();
    if (pathname.endsWith(".svg")) return ".svg";
    if (pathname.endsWith(".webp")) return ".webp";
    if (pathname.endsWith(".jpg") || pathname.endsWith(".jpeg")) return ".jpg";
    if (pathname.endsWith(".png")) return ".png";
  } catch {
    // fall through
  }
  return ".png";
}

export function getFileProxyUrl(key: string) {
  const baseUrl = config.API_BASE_URL.replace(/\/$/, "");
  return `${baseUrl}/api/files/${key}`;
}

export function guessContentType(key: string) {
  if (key.endsWith(".png")) return "image/png";
  if (key.endsWith(".jpg") || key.endsWith(".jpeg")) return "image/jpeg";
  if (key.endsWith(".webp")) return "image/webp";
  if (key.endsWith(".svg")) return "image/svg+xml";
  if (key.endsWith(".pdf")) return "application/pdf";
  return "application/octet-stream";
}

export async function getS3Object(key: string) {
  return getS3Client().send(
    new GetObjectCommand({
      Bucket: config.AWS_S3_BUCKET,
      Key: key,
    })
  );
}

export async function uploadS3Object(key: string, body: Buffer, contentType: string) {
  await getS3Client().send(
    new PutObjectCommand({
      Bucket: config.AWS_S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
}

export async function getPartnerLogoUploadUrl(partnerId: string) {
  const key = getPartnerLogoPath(partnerId);
  const command = new PutObjectCommand({
    Bucket: config.AWS_S3_BUCKET,
    Key: key,
    ContentType: "image/png",
  });

  const uploadUrl = await getSignedUrl(getS3Client(), command, { expiresIn: 900 });
  const publicUrl = getFileProxyUrl(key);

  return {
    uploadUrl,
    publicUrl,
    key,
  };
}

export async function uploadPartnerLogo(partnerId: string, fileBuffer: Buffer, contentType: string) {
  const key = getPartnerLogoPath(partnerId);
  await uploadS3Object(key, fileBuffer, contentType);

  return {
    key,
    logoUrl: getFileProxyUrl(key),
  };
}

export async function uploadBankLogo(
  bankId: string,
  fileBuffer: Buffer,
  contentType: string,
  extension: string
) {
  const key = getBankLogoPath(bankId, extension);
  await uploadS3Object(key, fileBuffer, contentType);

  return {
    key,
    logoUrl: getFileProxyUrl(key),
  };
}

export function getApplicationDocumentPath(applicationId: string, documentType: string, fileName: string) {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `private/applications/${applicationId}/${documentType}/${Date.now()}-${safeName}`;
}

export async function uploadApplicationDocument(
  applicationId: string,
  documentType: string,
  fileBuffer: Buffer,
  contentType: string,
  fileName: string
) {
  const key = getApplicationDocumentPath(applicationId, documentType, fileName);
  await uploadS3Object(key, fileBuffer, contentType);

  return {
    key,
    fileUrl: getFileProxyUrl(key),
  };
}
