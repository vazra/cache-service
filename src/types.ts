export type ICacheConfig = {
  storeName?: string;
  clone?: boolean;
  maxLife?: number;
  expires?: string | Date;
  autoRemoveInterval?: number;
};

export type ICacheObj = {
  data: { [dataKey: string]: any };
};

export type IRootObj = {
  [key: string]: ICacheObj;
};

export type IRecord = {
  id?: string;
  isNew?: boolean;
  toDelete?: boolean;
  hits?: number;
  lastHit?: Date;
  createdOn?: Date;
  updatedOn?: Date;
  expiresOn?: Date;
  value?: any;
};

export type IKeyVal = {
  key: string;
  value: any;
};
