const fs = require("fs");
const path = require("path");

let key = process.argv[2];
if (!key) throw new Error("Provide collection key");
let collectionKey = key?.replace(/[^a-zA-Z0-9]/g, "-")?.toLowerCase() || "";
if (!collectionKey) throw new Error(`Collection key is not valid: '${collectionKey}'`);

let collPath = path.join(process.cwd(), "src/api", collectionKey);
if (fs.existsSync(collPath)) {
  throw new Error(`path: ${collPath} already exists. `);
}

fs.mkdirSync(collPath, { recursive: true });

let jsName = collectionKey
  .split("-")
  .map((item) => `${item[0].toUpperCase()}${item.substring(1, item.length)}`)
  .join("");

let collectionName = `${jsName}Collection`;
let controllerName = `${jsName}Controller`;
let schemaName = `${jsName}Schema`;
let serviceName = `${jsName}Service`;

// Collection Registry
fs.writeFileSync(
  path.join(collPath, `${collectionName}.ts`),
  `import { ICollectionDefinition } from "@root/types/collections";
import ${jsName}Controller from "./${jsName}Controller";
import { ${jsName}Schema } from "./${jsName}Schema";
import ${jsName}Service from "./${jsName}Service";

const ${jsName}Collection: ICollectionDefinition = {
  key: "${collectionKey}",
  controller: ${jsName}Controller,
  service: ${jsName}Service,
  schema: ${jsName}Schema,
  type: "list",
};
export default ${jsName}Collection;
`,
  { encoding: "utf-8" }
);

// Controller
fs.writeFileSync(
  path.join(collPath, `${controllerName}.ts`),
  `import { ${jsName}CollectionKey } from "./${jsName}Schema";
import { createController } from "@lib/BaseController";

export default createController(${jsName}CollectionKey, []);
`,
  { encoding: "utf-8" }
);

// Schema
fs.writeFileSync(
  path.join(collPath, `${schemaName}.ts`),
  `import { Schema, InferSchemaType } from "mongoose";
import { dataModifierSchema } from "@lib/cms";
import { createOIdString } from "@root/utils/commonUtils";

export const ${jsName}CollectionKey = "${collectionKey}";

export const ${jsName}Schema = new Schema({
  ...dataModifierSchema,
  _id: { type: String, default: createOIdString },
});

export type I${jsName} = InferSchemaType<typeof ${jsName}Schema> & {};
`,
  { encoding: "utf-8" }
);

// Service
fs.writeFileSync(
  path.join(collPath, `${serviceName}.ts`),
  `import { BaseService, serviceWithContext } from "@lib/BaseService";
import { I${jsName}, ${jsName}CollectionKey } from "./${jsName}Schema";
import { ICMSContext } from "@root/types/cms";

class ${jsName}ServiceClass extends BaseService<I${jsName}> {
  constructor(context: ICMSContext) {
    super(${jsName}CollectionKey, context);
  }
}

const ${jsName}Service = serviceWithContext<${jsName}ServiceClass>(${jsName}ServiceClass);
export default ${jsName}Service;
export { ${jsName}ServiceClass };
`,
  { encoding: "utf-8" }
);

// Append to global collections
let globalCollectionPath = path.join(process.cwd(), "src/collections.ts");
if (fs.existsSync(globalCollectionPath)) {
  let collectionsContent = fs.readFileSync(globalCollectionPath, { encoding: "utf-8" });
  fs.writeFileSync(
    globalCollectionPath,
    collectionsContent
      .replace("//More Here", `"${collectionKey}": ${jsName}Collection,\n  //More Here`)
      .replace(
        "//More Import Here",
        `import ${jsName}Collection from "./api/${collectionKey}/${jsName}Collection";\n//More Import Here`
      ),
    { encoding: "utf-8" }
  );
  console.log(`Successfully generated collection scaffolding under: ${collPath}`);
}
