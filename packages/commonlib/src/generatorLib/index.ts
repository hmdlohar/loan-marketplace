export function getTSType(instance: string): string {
  switch (instance) {
    case "String":
    case "ObjectID":
    case "Date":
      return "string";
    case "Number":
      return "number";
    case "Boolean":
      return "boolean";
    case "Mixed":
      return "any";
    default:
      return "any";
  }
}

export function generateInterfaceFromMongooseSchema(mongooseSchema: any, jsName: string): string {
  let ts = generateInterfaceTypes(mongooseSchema);

  return `export interface I${jsName} {
${ts}
}
`;
}

function generateInterfaceTypes(mongooseSchema: any, depth: number[] = [0]): string {
  let spaces = depth.map(() => `  `).join("");

  let fields = Object.values(mongooseSchema.paths)
    .map((objPath: any) => {
      if (objPath.path.endsWith("$*")) return "";
      let jsType = getTSType(objPath.instance);
      if (objPath.schema) {
        let res = generateInterfaceTypes(objPath.schema, [...depth, 0]);
        return `${spaces}${objPath.path}${objPath.isRequired ? "" : "?"}: {\n${res}\n${spaces}}${
          objPath.instance === "Array" ? "[]" : ""
        };`;
      } else {
        if (objPath.instance === "Map") {
          return `${spaces}${objPath.path}${objPath.isRequired ? "" : "?"}: {\n${spaces}  [key: string]: ${getTSType(
            objPath.options?.of?.name || "String"
          )};\n${spaces}};`;
        }
        return `${spaces}${objPath.path}${objPath.isRequired ? "" : "?"}: ${jsType || "any"}${
          objPath.instance === "Array" ? "[]" : ""
        };`;
      }
    })
    .filter((field) => field !== "")
    .join("\n");
  return `${fields}`;
}

export function generateBeautyName(name: string): string {
  return name
    .split("-")
    .map((item) => `${item[0].toUpperCase()}${item.substring(1, item.length)}`)
    .join(" ");
}

export function generateJSName(name: string): string {
  return generateBeautyName(name).replace(/ /gi, "");
}

export function depthSpaces(depth: number): string {
  if (depth < 0) return "";
  return Array.from(new Array(depth))
    .map(() => `  `)
    .join("");
}
