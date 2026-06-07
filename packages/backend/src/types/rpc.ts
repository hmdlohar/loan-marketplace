import { ICMSContext } from "./cms";

export interface IRPCFunctionDefinition {
  title?: string;
  callback: (args: any, context: ICMSContext) => Promise<any>;
  argsSchema?: any;
  returnSchema?: any;
  /** If non of the access is defined then route is not allowed for anyone.  */
  access?: {
    /* allowFn takes priority over allow and deny */
    allowFn?: (context: ICMSContext) => boolean;
    /* allow only listed roles 
      There will be special roles. 
      public: anyone can access
      authenticated: login required
      customer: only customers can access
      partner: only partners can access
      admin: only admins can access
    */
    allow?: string[]; // Roles
    /* Allow other then listed roles */
    deny?: string[]; // Roles
  };
}
