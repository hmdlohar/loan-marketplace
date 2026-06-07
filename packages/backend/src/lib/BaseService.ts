import {
  DefaultContext,
  ICMSContext,
  IContextOptions,
  IRequestQueryParams,
  SystemContext,
} from "@root/types/cms";
import {
  AggregateOptions,
  AnyKeys,
  AnyObject,
  FilterQuery,
  HydratedDocument,
  PipelineStage,
  ProjectionType,
  QueryOptions,
  QueryWithHelpers,
  UpdateQuery,
  UpdateWriteOpResult,
} from "mongoose";

export interface IMutationData<T = any> {
  old?: T;
  new?: T;
  args?: { filter?: any; update?: any };
  result?: any;
}

export type IMutationOperation = "create" | "delete" | "deleteMany" | "updateMany" | "updateOne";

function lazyGetModal<T>(key: string) {
  return require("./cms").getModal<T>(key);
}

function lazyGetCollection(key: string) {
  return require("./cms").getCollection(key);
}

export class BaseService<T> {
  constructor(collectionKey: string, context: ICMSContext) {
    this.collectionKey = collectionKey;
    this.context = context || DefaultContext;
  }
  context: ICMSContext;
  collectionKey: string = "";
  upsertOnUpdate: boolean = false;

  mutationListener?: (operation: IMutationOperation, data: IMutationData<T>) => void;

  async onMutation(operation: IMutationOperation, data: IMutationData<T>) {
    if (this.mutationListener) this.mutationListener(operation, data);
  }

  registerMutationListener(cb: (operation: IMutationOperation, data: IMutationData<T>) => void) {
    this.mutationListener = async (operation: IMutationOperation, data: IMutationData<T>) => {
      cb(operation, data);
    };
  }

  validateContext(operation: string) {
    if (!this.context)
      throw new Error(`You cannot perform operation ${operation} on collection ${this.collectionKey} without context`);
    if (this.context.SystemUserID === "DEFAULT")
      throw new Error(
        `You cannot perform operation ${operation} on collection ${this.collectionKey} with default context`
      );
  }

  list = async (io: {
    filter?: FilterQuery<T>;
    project?: ProjectionType<T>;
    sort?: string;
    sortOrder?: string;
    page?: number;
    pageSize?: number;
    search?: string;
    session?: any;
    aggregate?: PipelineStage[];
    addTotalRowCountToHeader?: boolean;
  } = {}): Promise<HydratedDocument<T, {}, {}>[]> => {
    this.validateContext("list");
    let coll = lazyGetCollection(this.collectionKey);
    let project = io.project || coll.defaultProject;

    let q: any = null;
    if (io.aggregate) {
      let ary: PipelineStage[] = [
        {
          $match: {
            ...io.filter,
          },
        },
        ...io.aggregate,
      ];
      q = lazyGetModal<T>(this.collectionKey).aggregate<T>(ary);
    } else {
      let dbQuery = lazyGetModal<T>(this.collectionKey).find(
        { ...io.filter },
        project
      );
      if (io.sort) {
        dbQuery = dbQuery.sort({ [io.sort]: io.sortOrder === "asc" ? 1 : -1 });
      }
      if (io.page && io.pageSize) {
        dbQuery = dbQuery.skip((io.page - 1) * io.pageSize).limit(io.pageSize);
      }
      q = dbQuery;
    }

    const result = await q.exec();
    return result;
  };

  count = async (
    io: {
      filter?: any;
    } = {}
  ): Promise<number> => {
    this.validateContext("count");
    return await lazyGetModal<T>(this.collectionKey).countDocuments(io.filter);
  };

  get = async (
    _id: string,
    options?: { project?: ProjectionType<T>; session?: any }
  ): Promise<HydratedDocument<T, {}, {}> | null> => {
    this.validateContext("get");
    let project = options?.project;
    let q = lazyGetModal<T>(this.collectionKey).findOne({ _id }, project);
    if (options?.session) q.session(options.session);
    let result = await q.exec();
    return result;
  };

  get_Throwable = async (
    _id: string,
    options?: { project?: ProjectionType<T>; session?: any }
  ): Promise<HydratedDocument<T, {}, {}>> => {
    let obj = await this.get(_id, options);
    if (!obj) throw new Error(`${this.collectionKey} document not found with _id ${_id}`);
    return obj;
  };

  create = async (obj: Partial<T>, options: { session?: any } = {}) => {
    this.validateContext("create");

    let res = await lazyGetModal<T>(this.collectionKey).create(
      [
        {
          ...obj,
          CreatedBy: this.context.SystemUserID,
          CreatedAt: new Date(),
        },
      ],
      { session: options.session }
    );
    this.onMutation("create", { new: res[0] });
    return res[0];
  };

  update = async (
    _id: string,
    obj: AnyKeys<T> & AnyObject,
    options: {
      upsert?: boolean;
      session?: any;
    } = {}
  ) => {
    this.validateContext("update");
    let oldResult = await this.updateOne(
      { _id },
      {
        $set: obj,
      },
      {
        session: options.session,
        upsert: options.upsert,
      }
    );
    return oldResult;
  };

  delete = async (_id: string, options?: { session?: any }): Promise<any> => {
    return this.deleteOne({ _id }, options);
  };

  deleteOne = async (
    filter: FilterQuery<T>,
    options?: { session?: any }
  ): Promise<any> => {
    this.validateContext("delete");
    let res = await lazyGetModal<T>(this.collectionKey).findOneAndDelete(filter, {
      session: options?.session,
    });
    this.onMutation("delete", { old: res?.toObject(), args: { filter } });
    return res;
  };

  deleteBatch = async (_ids: string[], options?: { session?: any }): Promise<any> => {
    let condition = { _id: { $in: _ids } };
    let res = await this.deleteMany(condition, options);
    return res;
  };

  __getModel = () => {
    this.validateContext("getModel");
    return lazyGetModal<T>(this.collectionKey);
  };

  aggregate = async (pipeline?: PipelineStage[], options?: AggregateOptions) => {
    this.validateContext("aggregate");
    return this.__getModel().aggregate(pipeline, options);
  };

  updateOne = async (
    filter?: FilterQuery<T>,
    update?: UpdateQuery<T>,
    options?: QueryOptions<T> | null
  ): Promise<any> => {
    if (this.upsertOnUpdate && options) options.upsert = true;
    else if (this.upsertOnUpdate) options = { upsert: true };
    this.validateContext("updateOne");
    if (!(update as any)?.$set) {
      (update as any).$set = {};
    }

    (update as any).$set.ModifiedBy = this.context.SystemUserID;
    (update as any).$set.ModifiedAt = new Date();

    let newObj = await this.__getModel().findOneAndUpdate(filter, update, {
      returnDocument: "after",
      ...options,
    });

    this.onMutation("updateOne", {
      args: { update, filter },
      new: newObj?.toObject() || ({} as any),
    });
    return newObj;
  };

  updateMany = async (
    filter: FilterQuery<T>,
    update?: UpdateQuery<T>,
    options?: QueryOptions<T>
  ): Promise<UpdateWriteOpResult> => {
    if (!(update as any)?.$set) {
      (update as any).$set = {};
    }
    (update as any).$set.ModifiedBy = this.context.SystemUserID;
    (update as any).$set.ModifiedAt = new Date();
    let result = await this.__getModel().updateMany(filter, update, options);
    this.onMutation("updateMany", { result, args: { update, filter } });
    return result;
  };

  findOne = async (
    filter?: FilterQuery<T>,
    projection?: ProjectionType<T> | null,
    options?: QueryOptions<T> | null
  ): Promise<HydratedDocument<T, {}, {}> | null> => {
    this.validateContext("findOne");
    let res = await this.__getModel().findOne(filter, projection, options);
    return res;
  };

  exists = async (filter: FilterQuery<T>): Promise<boolean> => {
    this.validateContext("findOne");
    let res = await this.__getModel().exists(filter);
    return !!res;
  };

  deleteMany = async (filter: FilterQuery<T>, options?: QueryOptions<T>): Promise<any> => {
    let result = await this.__getModel().deleteMany(filter, options);
    this.onMutation("deleteMany", { result, args: { filter } });
    return result;
  };
}

export function serviceWithContext<T>(
  ServiceClass: new (context: ICMSContext) => T,
  defaultCtxOptions?: IContextOptions
) {
  let context = (context?: ICMSContext | "SYSTEM" | "TEMP", options?: IContextOptions): T => {
    if (!context) {
      let obj: any = new ServiceClass(DefaultContext);
      throw new Error(`Cannot instantiate service ${obj?.collectionKey || ""} without context`);
    }
    let ctx = { ...DefaultContext };
    if (context === "SYSTEM") ctx = { ...SystemContext };
    if (context === "TEMP") ctx = { ...DefaultContext };
    if (typeof context === "object") ctx = { ...context };

    ctx.options = {
      ...defaultCtxOptions,
      ...options,
      defaultCtxOptions: defaultCtxOptions,
    };
    let obj = new ServiceClass(ctx);
    return obj;
  };
  return { context };
}
