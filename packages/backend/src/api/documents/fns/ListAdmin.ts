import * as yup from "yup";
import { IRPCFunctionDefinition } from "@root/types/rpc";
import { ICMSContext } from "@root/types/cms";
import { DOCUMENT_TYPE, USER_ROLE } from "commonlib";
import DocumentsService from "@root/api/documents/DocumentsService";
import CustomersService from "@root/api/customers/CustomersService";
import { getDocumentParseStatus } from "@root/api/documents/fns/getDocumentParseStatus";

const argsSchema = yup.object({
  page: yup.number().integer().min(1).default(1),
  pageSize: yup.number().integer().min(1).max(100).default(20),
  sort: yup.string().oneOf(["CreatedAt", "DocumentType", "ModifiedAt"]).default("CreatedAt"),
  sortOrder: yup.string().oneOf(["asc", "desc"]).default("desc"),
  customerId: yup.string().optional(),
  documentType: yup.string().oneOf(Object.values(DOCUMENT_TYPE)).optional(),
  dateFrom: yup.string().optional(),
  dateTo: yup.string().optional(),
  parseStatus: yup.string().oneOf(["PENDING", "PARSED", "FAILED"]).optional(),
});
export type IListAdminArgs = yup.InferType<typeof argsSchema>;

type AdminDocumentRow = {
  _id: string;
  Name: string;
  DocumentType: string;
  CreatedAt?: string;
  ModifiedAt?: string;
  ParsedData?: Record<string, unknown>;
  ParseStatus: string;
  ParseError?: string;
  CustomerID?: string;
  CustomerLabel: string;
  FileUrl?: string;
  Path?: string;
};

type IListAdminReturnType = {
  items: AdminDocumentRow[];
  total: number;
  page: number;
  pageSize: number;
};

function buildCustomerLabel(customer: Record<string, any> | null | undefined) {
  if (!customer) {
    return "Unknown customer";
  }
  const fullName = customer.FullName || [customer.FirstName, customer.LastName].filter(Boolean).join(" ").trim();
  if (fullName && customer.Mobile) {
    return `${fullName} (${customer.Mobile})`;
  }
  if (fullName) {
    return fullName;
  }
  if (customer.Mobile) {
    return customer.Mobile;
  }
  return customer._id || "Unknown customer";
}

export async function ListAdmin(args: IListAdminArgs, context: ICMSContext): Promise<IListAdminReturnType> {
  const page = args.page || 1;
  const pageSize = args.pageSize || 20;
  const sort = args.sort || "CreatedAt";
  const sortOrder = args.sortOrder || "desc";

  const filter: Record<string, any> = {};

  if (args.customerId) {
    filter["Context.CustomerID"] = args.customerId;
  }

  if (args.documentType) {
    filter.DocumentType = args.documentType;
  }

  if (args.parseStatus) {
    filter.ParseStatus = args.parseStatus;
  }

  if (args.dateFrom || args.dateTo) {
    filter.CreatedAt = {};
    if (args.dateFrom) {
      filter.CreatedAt.$gte = new Date(args.dateFrom);
    }
    if (args.dateTo) {
      const endDate = new Date(args.dateTo);
      endDate.setHours(23, 59, 59, 999);
      filter.CreatedAt.$lte = endDate;
    }
  }

  const items = await DocumentsService.context(context).list({
    filter,
    sort,
    sortOrder,
    page,
    pageSize,
  });

  const total = await DocumentsService.context(context).count({ filter });

  const customerIds: string[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = typeof items[i].toObject === "function" ? items[i].toObject() : items[i];
    const customerId = item.Context?.CustomerID;
    if (customerId && !customerIds.includes(customerId)) {
      customerIds.push(customerId);
    }
  }

  const customerMap: Record<string, Record<string, any>> = {};
  if (customerIds.length > 0) {
    const customers = await CustomersService.context(context).list({
      filter: { _id: { $in: customerIds } },
      pageSize: customerIds.length,
    });
    for (let i = 0; i < customers.length; i++) {
      const customer = typeof customers[i].toObject === "function" ? customers[i].toObject() : customers[i];
      customerMap[customer._id] = customer;
    }
  }

  const rows: AdminDocumentRow[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = typeof items[i].toObject === "function" ? items[i].toObject() : items[i];
    const customerId = item.Context?.CustomerID;
    const customer = customerId ? customerMap[customerId] : null;
    const parsedData = (item.ParsedData || {}) as Record<string, unknown>;
    const parseStatus = item.ParseStatus || getDocumentParseStatus(parsedData);

    rows.push({
      _id: item._id,
      Name: item.Name,
      DocumentType: item.DocumentType,
      CreatedAt: item.CreatedAt ? new Date(item.CreatedAt).toISOString() : undefined,
      ModifiedAt: item.ModifiedAt ? new Date(item.ModifiedAt).toISOString() : undefined,
      ParsedData: parsedData,
      ParseStatus: parseStatus,
      ParseError: item.ParseError || (parsedData.parseError ? String(parsedData.parseError) : undefined),
      CustomerID: customerId,
      CustomerLabel: buildCustomerLabel(customer),
      Path: item.Path,
      FileUrl: item.Path ? `/api/files/${item.Path}` : undefined,
    });
  }

  return {
    items: rows,
    total,
    page,
    pageSize,
  };
}

const definition: IRPCFunctionDefinition = {
  callback: ListAdmin,
  argsSchema,
  access: {
    allow: [USER_ROLE.SYSTEM_ADMIN],
  },
};
export default definition;
