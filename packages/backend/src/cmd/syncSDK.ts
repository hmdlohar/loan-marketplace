import { collections } from "@root/collections";
import path from "path";
import * as fs from "fs";
import { createInterfaceForSchema, generateJSName } from "commonlib";

let sdkPath = path.join(process.cwd(), "../backendsdk");
let sdkFilePath = path.join(sdkPath, "src/BackendSDK.ts");
let typesFilePath = path.join(sdkPath, "src/types.ts");

export async function syncSDK() {
  if (!fs.existsSync(sdkFilePath)) {
    throw new Error(`file "${sdkFilePath}" does not exist.`);
  }
  if (!fs.existsSync(typesFilePath)) {
    throw new Error(`file "${typesFilePath}" does not exist.`);
  }
  let fnsText = ``;
  let typesText = `export type ICollectionKeys = ${Object.keys(collections)
    .map((key) => `"${key}"`)
    .join(" | ")};\n\n`;

  for (let key in collections) {
    let collname = generateJSName(key);
    for (let objController of collections[key].controller) {
      if (objController.method === "post" && objController.route.length > 2) {
        let beautyRoute = generateJSName(objController.route.replace(/\//g, ""));

        let fnName = `${collname}_${beautyRoute}`;
        fnsText += `  async ${fnName}(
    args: types.I${fnName}Args
  ): Promise<ITHTResponse<types.I${fnName}ReturnType>> {
    return this.cmsQuery("${key}", args, { method: "post", route: "${objController.route}" });
  }\n`;
        if (objController.bodyDTO && typeof objController.bodyDTO.describe === "function") {
          typesText += `${createInterfaceForSchema(objController.bodyDTO.describe(), `I${fnName}Args`)}\n`;
        } else {
          typesText += `export type I${fnName}Args = any;\n`;
        }
        if (objController.returnDTO && typeof objController.returnDTO.describe === "function") {
          typesText += `${createInterfaceForSchema(objController.returnDTO.describe(), `I${fnName}ReturnType`)}\n`;
        } else {
          typesText += `export type I${fnName}ReturnType = any;\n`;
        }
      }
    }
  }

  let sdkContent = fs.readFileSync(sdkFilePath, "utf-8");
  sdkContent = sdkContent.replace(
    /\/\/ Methods Start([\S\s]*?)Methods End/m,
    `// Methods Start\n${fnsText}\n  // Methods End`
  );
  fs.writeFileSync(sdkFilePath, sdkContent, "utf-8");
  fs.writeFileSync(typesFilePath, typesText, "utf-8");
  console.log("Successfully synced all RPC methods and types in backendsdk.");
}
if (require.main === module) {
  syncSDK().catch((ex) => console.log(ex.message));
}
