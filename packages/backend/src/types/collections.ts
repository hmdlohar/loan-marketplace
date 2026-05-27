import { Schema } from "mongoose";

export interface ICollectionDefinition {
  key: string;
  controller: any;
  service: any;
  schema: Schema<any>;
  type: "list" | "singleton";
  dbConnection?: "default";
  defaultFilter?: any;
  defaultProject?: any;
  searchColumns?: string[];
  access?: {
    allow: string[];
    create?: string[];
    read?: string[];
    update?: string[];
    delete?: string[];
  };
  autoIncrement?: {
    fieldName?: string;
    startAt?: number;
    incrementBy?: number;
    prefix?: string;
  };
}

export type ICollectionDefinitionObject = Record<string, ICollectionDefinition>;
