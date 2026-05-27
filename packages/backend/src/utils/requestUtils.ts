import { AppRequest } from "@root/types/app";
import { IRequestQueryParams } from "@root/types/cms";

const DEFAULT_PAGE_SIZE = 10;

export function tryJSONParse(str: string) {
  try {
    return JSON.parse(str);
  } catch (ex) {
    return null;
  }
}

export function extractQueryParams(req: AppRequest) {
  let q: IRequestQueryParams = {};
  const { page, pageSize, sort, sortOrder, includeCount, filter, include, exclude, search } = req.query;
  if (page && pageSize) {
    q.page = parseInt((page || "") as any) || 1;
    if (pageSize !== "0") q.pageSize = parseInt((pageSize || "") as any) || DEFAULT_PAGE_SIZE;
  } else {
    q.page = 1;
    q.pageSize = DEFAULT_PAGE_SIZE;
  }
  if (sort) {
    q.sort = sort?.toString();
    q.sortOrder = sortOrder?.toString() || "desc";
  }

  q.includeCount = includeCount === "true";

  if (search) q.search = search?.toString();
  if (filter) q.filter = tryJSONParse(filter?.toString() || "") || undefined;
  if (include || exclude) {
    q.project = {};
    if (include) {
      let splitedInclude = include?.toString().split(",");
      for (let field of splitedInclude) {
        if (field) q.project[field] = true;
      }
    }
    if (exclude) {
      let splitedexclude = exclude?.toString().split(",");
      for (let field of splitedexclude) {
        if (field) q.project[field] = false;
      }
    }
  }
  return q;
}
