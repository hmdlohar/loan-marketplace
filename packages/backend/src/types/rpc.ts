import { ICMSContext } from "./cms";

export interface IRPCFunctionDefinition {
  title?: string;
  callback: (args: any, context: ICMSContext) => Promise<any>;
  argsSchema?: any;
  returnSchema?: any;
  access?: {
    allow: string[];
  };
}
