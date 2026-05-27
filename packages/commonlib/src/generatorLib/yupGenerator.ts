import { depthSpaces } from "./index";

export function createInterfaceForSchema(schema: any, interfaceName: string): string {
  let text = `export type ${interfaceName} = ${getTypeForField(schema)};\n`;
  return text;
}

function getTypeForField(field: any, depth: number = 0): string {
  if (!field) return "";
  if (field.type === "object") {
    let typeList: string = Object.keys(field.fields)
      .map((key: any) => {
        let isRequired = field.fields[key]?.exclusiveTests?.required;
        if (field.fields[key]?.spec?.nullable) isRequired = false;
        return `${depthSpaces(depth + 1)}${key}${isRequired ? "" : "?"}: ${getTypeForField(
          field.fields[key],
          depth + 1
        )};`;
      })
      .join("\n");
    return `{\n${typeList}\n${depthSpaces(depth)}}`;
  } else if (field.type === "array") {
    return `${getTypeForField(field.innerType, depth)}[]`;
  } else if (field.type === "date") {
    return "Date";
  } else if (field.type === "mixed") {
    return "any";
  } else {
    return field.type;
  }
}
