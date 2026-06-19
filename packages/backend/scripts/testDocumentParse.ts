/**
 * Local document parsing test — reads sample files from disk and runs the same
 * parse pipeline used on upload (parseDocumentWithStatus + buildDocumentParseFields).
 *
 * Usage:
 *   pnpm --filter backend test:parse
 *   pnpm --filter backend test:parse -- --file pan1.jpg --type PAN
 *   pnpm --filter backend test:parse -- --dir /path/to/files
 *   pnpm --filter backend test:parse -- --list
 */
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { DOCUMENT_TYPE } from "commonlib";
import {
  buildDocumentParseFields,
  parseDocumentWithStatus,
} from "../src/api/documents/fns/parseDocumentWithStatus";
import { guessContentType } from "../src/utils/s3Util";

dotenv.config({ path: path.join(__dirname, "../.env") });

const DEFAULT_FILES_DIR = "/media/hyper2/HYPER/projects/node/adie/files";

type ParseCase = {
  file: string;
  documentType: DOCUMENT_TYPE;
};

const DEFAULT_CASES: ParseCase[] = [
  { file: "pan1.jpg", documentType: DOCUMENT_TYPE.PAN },
  { file: "pan2.png", documentType: DOCUMENT_TYPE.PAN },
  { file: "aadhar1.webp", documentType: DOCUMENT_TYPE.AADHAAR },
  { file: "aadhar2.jpg", documentType: DOCUMENT_TYPE.AADHAAR },
  { file: "aadhar-pan.jpg", documentType: DOCUMENT_TYPE.PAN },
  { file: "payslip.pdf", documentType: DOCUMENT_TYPE.SALARY_SLIP },
  { file: "payslip_compressed.pdf", documentType: DOCUMENT_TYPE.SALARY_SLIP },
];

type CliOptions = {
  filesDir: string;
  cases: ParseCase[];
  listOnly: boolean;
};

function parseArgs(argv: string[]): CliOptions {
  let filesDir = process.env.FILES_DIR || DEFAULT_FILES_DIR;
  let listOnly = false;
  let file = "";
  let documentType = "";
  const cases: ParseCase[] = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--dir" && argv[i + 1]) {
      filesDir = argv[++i];
      continue;
    }
    if (arg === "--file" && argv[i + 1]) {
      file = argv[++i];
      continue;
    }
    if (arg === "--type" && argv[i + 1]) {
      documentType = argv[++i];
      continue;
    }
    if (arg === "--list") {
      listOnly = true;
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }
  }

  if (file) {
    if (!documentType) {
      console.error("Error: --type is required when using --file (e.g. --type PAN).");
      process.exit(1);
    }
    if (!Object.values(DOCUMENT_TYPE).includes(documentType as DOCUMENT_TYPE)) {
      console.error(`Error: invalid document type "${documentType}".`);
      process.exit(1);
    }
    cases.push({ file, documentType: documentType as DOCUMENT_TYPE });
  } else {
    cases.push(...DEFAULT_CASES);
  }

  return { filesDir, cases, listOnly };
}

function printHelp() {
  console.log(`Document parse test

Usage:
  pnpm --filter backend test:parse
  pnpm --filter backend test:parse -- --file pan1.jpg --type PAN
  pnpm --filter backend test:parse -- --dir ${DEFAULT_FILES_DIR}
  pnpm --filter backend test:parse -- --list

Options:
  --dir <path>    Sample files directory (default: ${DEFAULT_FILES_DIR})
  --file <name>   Parse a single file from --dir
  --type <type>   Document type: PAN, AADHAAR, SALARY_SLIP, BANK_STATEMENT, ...
  --list          List default test cases and exit
  --help, -h      Show this help

Env:
  ZEN_API_KEY, LLM_VISION_MODEL, etc. — loaded from packages/backend/.env
  FILES_DIR       Default directory for sample files
`);
}

function guessDocumentTypeFromFileName(fileName: string): DOCUMENT_TYPE | undefined {
  const lower = fileName.toLowerCase();
  if (lower.includes("pan")) {
    return DOCUMENT_TYPE.PAN;
  }
  if (lower.includes("aadhar") || lower.includes("aadhaar")) {
    return DOCUMENT_TYPE.AADHAAR;
  }
  if (lower.includes("payslip") || lower.includes("salary")) {
    return DOCUMENT_TYPE.SALARY_SLIP;
  }
  if (lower.includes("bank")) {
    return DOCUMENT_TYPE.BANK_STATEMENT;
  }
  if (lower.includes("itr")) {
    return DOCUMENT_TYPE.ITR;
  }
  if (lower.includes("gst")) {
    return DOCUMENT_TYPE.GST_RETURN;
  }
  return undefined;
}

function formatMs(ms: number) {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  return `${(ms / 1000).toFixed(1)}s`;
}

async function runCase(filesDir: string, testCase: ParseCase) {
  const filePath = path.join(filesDir, testCase.file);
  if (!fs.existsSync(filePath)) {
    return {
      file: testCase.file,
      documentType: testCase.documentType,
      skipped: true,
      reason: "file not found",
    };
  }

  const fileBuffer = fs.readFileSync(filePath);
  const contentType = guessContentType(testCase.file);
  const started = Date.now();

  const parseResult = await parseDocumentWithStatus({
    documentType: testCase.documentType,
    fileBuffer,
    contentType,
    fileName: testCase.file,
  });
  const fields = buildDocumentParseFields(parseResult);

  return {
    file: testCase.file,
    documentType: testCase.documentType,
    contentType,
    sizeKb: Math.round(fileBuffer.length / 1024),
    durationMs: Date.now() - started,
    parseStatus: fields.ParseStatus,
    parseError: fields.ParseError,
    parsedData: fields.ParsedData,
    skipped: false,
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.listOnly) {
    console.log(`Sample directory: ${options.filesDir}\n`);
    for (const testCase of options.cases) {
      const exists = fs.existsSync(path.join(options.filesDir, testCase.file));
      console.log(`  ${exists ? "✓" : "✗"} ${testCase.file} → ${testCase.documentType}`);
    }
    return;
  }

  if (!process.env.ZEN_API_KEY && !process.env.OPENROUTER_API_KEY && !process.env.OPENAI_API_KEY) {
    console.error("Error: set ZEN_API_KEY (or another LLM key) in packages/backend/.env");
    process.exit(1);
  }

  console.log(`Document parse test`);
  console.log(`Files dir: ${options.filesDir}`);
  console.log(`Vision model: ${process.env.LLM_VISION_MODEL || "mimo-v2.5-free (default)"}`);
  console.log(`Cases: ${options.cases.length}\n`);

  const results = [];
  for (const testCase of options.cases) {
    process.stdout.write(`→ ${testCase.file} (${testCase.documentType}) ... `);
    const result = await runCase(options.filesDir, testCase);
    results.push(result);

    if (result.skipped) {
      console.log(`SKIP (${result.reason})`);
      continue;
    }

    console.log(`${result.parseStatus} (${formatMs(result.durationMs)})`);
    if (result.parseStatus === "FAILED" && result.parseError) {
      console.log(`  error: ${result.parseError}`);
    } else if (result.parseStatus === "PARSED") {
      console.log(`  data: ${JSON.stringify(result.parsedData, null, 2).split("\n").join("\n  ")}`);
    }
  }

  const parsed = results.filter((r) => !r.skipped && r.parseStatus === "PARSED").length;
  const failed = results.filter((r) => !r.skipped && r.parseStatus === "FAILED").length;
  const skipped = results.filter((r) => r.skipped).length;

  console.log(`\nSummary: ${parsed} parsed, ${failed} failed, ${skipped} skipped`);
  if (failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((ex) => {
  console.error("\nFatal:", ex?.message || ex);
  process.exit(1);
});

export { guessDocumentTypeFromFileName, DEFAULT_CASES, DEFAULT_FILES_DIR };
