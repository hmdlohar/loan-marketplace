export interface IBaseDocuments {
  CreatedAt: string;
  ModifiedAt?: string;
  ModifiedBy?: string;
  CreatedBy?: string;
  _id?: string;
  Name: string;
  Path: string;
  DocumentType: string;
  Context?: {
    ApplicationID?: string;
    UserID?: string;
    CustomerID?: string;
    ProductID?: string;
  };
  ParsedData?: any;
}
