export interface IBaseCronLog {
  CreatedAt: string;
  ModifiedAt?: string;
  ModifiedBy?: string;
  CreatedBy?: string;
  _id?: string;
  Key: string;
  Status: string;
  Comment: string;
  Data?: any;
  ex?: any;
}
