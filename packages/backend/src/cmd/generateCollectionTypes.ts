import { collections } from "@root/collections";
import { generateInterfaceFromMongooseSchema, generateJSName } from "commonlib";
import * as fs from "fs";
import path from "path";

let commonLibDir = path.join(process.cwd(), "../backendsdk", "src", "collection");

export function generateCollectionTypes(collName?: string) {
  let indexFile = ``;
  let lstFilesToWrite: { text: string; path: string }[] = [];
  
  for (let key in collections) {
    if (collName && key !== collName) continue;
    
    let inter = generateInterfaceFromMongooseSchema(collections[key].schema, generateJSName(`base-${key}`));

    lstFilesToWrite.push({
      path: path.join(commonLibDir, `${key}.type.ts`),
      text: inter,
    });
    indexFile += `export * from "./${key}.type";\n`;
  }

  fs.mkdirSync(commonLibDir, { recursive: true });
  for (let objFile of lstFilesToWrite) {
    fs.writeFileSync(objFile.path, objFile.text, "utf-8");
  }
  fs.writeFileSync(path.join(commonLibDir, "index.ts"), indexFile, "utf-8");
  console.log("Successfully generated all collection types in backendsdk.");
}
