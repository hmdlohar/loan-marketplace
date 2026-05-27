const path = require("path");
const fs = require("fs");
const { generateJSName } = require("commonlib");

let rootDir = path.join(__dirname, "../src");

async function fnDo(collectionName, fnPath) {
  if (!collectionName) throw new Error("Collection name is required.");
  if (!fnPath) throw new Error("Function name is required.");
  
  let collectionPath = path.join(rootDir, "api/", collectionName);
  if (!fs.existsSync(collectionPath)) {
    throw new Error(`Collection directory not found: ${collectionPath}`);
  }

  let collectionJSName = generateJSName(collectionName);
  let fnName = `${generateJSName(fnPath)}`.replace(/\//g, "_").replace(".ts", "");

  let filePath = path.join(collectionPath, "fns", fnName);
  if (!filePath.endsWith(".ts")) filePath += ".ts";
  if (fs.existsSync(filePath)) {
    throw new Error(`file "${filePath}" already exists.`);
  }

  let controllerPath = path.join(collectionPath, `${collectionJSName}Controller.ts`);
  console.log("controllerPath", controllerPath);
  let controllerContent = fs.readFileSync(controllerPath, "utf-8");
  
  controllerContent = `import ${fnName}Definition from "./fns/${fnName}";\n${controllerContent}`;
  
  // Import RPC item if needed
  if (!controllerContent.includes("rpcItem")) {
    controllerContent = controllerContent.replace("createController }", "createController, rpcItem }");
  }
  
  let routeObject = `  rpcItem({
    route: "/${fnName}",
    definition: ${fnName}Definition,
  })`;

  if (controllerContent.includes(`createController(${collectionJSName}CollectionKey,[]);`)) {
    controllerContent = controllerContent.replace(
      `createController(${collectionJSName}CollectionKey,[]);`,
      `createController(${collectionJSName}CollectionKey, [
${routeObject},
]);`
    );
  } else if (controllerContent.includes(`createController(${collectionJSName}CollectionKey, [`)) {
    controllerContent = controllerContent.replace(
      `createController(${collectionJSName}CollectionKey, [`,
      `createController(${collectionJSName}CollectionKey, [\n${routeObject},`
    );
  } else {
    controllerContent = controllerContent.replace(
      `createController(${collectionJSName}CollectionKey,[`,
      `createController(${collectionJSName}CollectionKey,[\n${routeObject},`
    );
  }

  let fnContent = `import * as yup from "yup";
import { IRPCFunctionDefinition } from "@root/types/rpc";
import { ICMSContext } from "@root/types/cms";

const argsSchema = yup.object({});
export type I${fnName}Args = yup.InferType<typeof argsSchema>;

type I${fnName}ReturnType = any;

export async function ${fnName}(
  args: I${fnName}Args,
  context: ICMSContext
): Promise<I${fnName}ReturnType> {
  // Implement RPC logic
  return [];
}

const definition: IRPCFunctionDefinition = {
  callback: ${fnName},
  argsSchema,
};
export default definition;
`;

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, fnContent, "utf-8");
  fs.writeFileSync(controllerPath, controllerContent, "utf-8");
  console.log(`Successfully generated RPC function file: ${filePath}`);
}

fnDo(process.argv[2], process.argv[3]).catch((ex) => console.log(ex.message));
