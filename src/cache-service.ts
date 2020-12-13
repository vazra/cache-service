import { defaults, addMSToNow } from './helpers/common';
import { v1 as uuidv1 } from 'uuid';

import clone from 'clone';
import sizeOf from 'object-sizeof';
import { ICacheConfig, IRootObj, ICacheObj, IKeyVal, IRecord } from './types';

export class CacheService {
  DEFAULT_CONFIG: ICacheConfig;
  STORAGE_KEY: string;
  private _conf: ICacheConfig = {};
  private _root: IRootObj = {};
  private _memory: ICacheObj = { data: {} };
  private _expiryTimer: any = null;

  constructor(conf = {}) {
    this.STORAGE_KEY = 'store_key';

    /**
     * CacheService default configuration
     */
    this.DEFAULT_CONFIG = {
      storeName: '',
      clone: false,
      maxLife: 0,
      expires: undefined,
      autoRemoveInterval: 0,
    };

    this.setConfig(conf);
  }

  /**
   * Set configuration
   */
  setConfig(newConf: ICacheConfig) {
    defaults(newConf, this.DEFAULT_CONFIG);

    this._conf = newConf;

    /**
     * Root object
     */
    this._root = {};

    if (newConf.storeName) this.STORAGE_KEY += newConf.storeName;

    if (!this._root[this.STORAGE_KEY]) {
      this._root[this.STORAGE_KEY] = {
        data: {},
      };
    }

    this._memory = this._root[this.STORAGE_KEY];

    if (this._expiryTimer) {
      clearInterval(this._expiryTimer);
      this._expiryTimer = null;
    }

    // crates a timer in specific intervel to remove expired records
    if (newConf.autoRemoveInterval) {
      this._expiryTimer = setInterval(() => {
        this.removeExpired();
      }, newConf.autoRemoveInterval * 1000);
    }
  }

  /**
   * Get configuration
   */
  getConfig() {
    return this._conf;
  }

  // add or update record

  add(key: string, value: any, aConf: ICacheConfig = {}) {
    aConf = defaults(aConf, this._conf);

    if (aConf.clone) {
      value = clone(value);
    }

    const record: IRecord = {
      id: undefined,
      isNew: true,
      toDelete: true,
      hits: 0,
      value: value,
      lastHit: undefined,
      createdOn: undefined,
      updatedOn: undefined,
      expiresOn: undefined,
    };

    if (
      aConf.expires &&
      (aConf.expires instanceof Date || typeof aConf.expires === 'string')
    ) {
      record.expiresOn = new Date(aConf.expires);
    } else if (aConf.maxLife && typeof aConf.maxLife === 'number') {
      record.expiresOn = addMSToNow(aConf.maxLife);
    }

    if (this.has(key)) {
      record.isNew = false;
      record.hits = this._memory.data[key].hits;
      record.id = this._memory.data[key].id;
      record.createdOn = this._memory.data[key].createdOn;
      record.updatedOn = new Date();
    } else {
      record.id = uuidv1();
      record.createdOn = new Date();
    }

    this._memory.data[key] = record;

    return record;
  }

  /**
   * Get record by key
   */
  fetch(key: string) {
    if (this.has(key)) {
      if (this.canBeAutoRemove(key)) {
        this.remove(key);
        return undefined;
      }

      this._memory.data[key].hits += 1;
      this._memory.data[key].lastHit = new Date();

      return this._memory.data[key].value;
    } else {
      return undefined;
    }
  }

  /**
   * Get info record by key
   */
  info(key: string) {
    if (this.has(key)) {
      if (this.canBeAutoRemove(key)) {
        this.remove(key);
        return undefined;
      }

      const record = Object.assign({}, this._memory.data[key]);
      delete record.value;

      return record;
    } else {
      return undefined;
    }
  }

  /**
   * Delete a record
   */
  remove(key: string) {
    delete this._memory.data[key];
  }

  /**
   * Remove expired records
   */
  removeExpired() {
    const expired = [];
    for (let key in this._memory.data) {
      if (
        this._memory.data.hasOwnProperty(key) &&
        this.expired(key) &&
        this._memory.data[key].toDelete
      ) {
        this.remove(key);
        expired.push(key);
      }
    }
    return expired;
  }

  /**
   * Fetch all records
   */
  fetchall() {
    let records: IKeyVal[] = [];

    for (let key in this._memory.data) {
      if (this._memory.data.hasOwnProperty(key)) {
        if (this.canBeAutoRemove(key)) {
          this.remove(key);
        } else {
          records.push({
            key: key,
            value: this._memory.data[key].value,
          });
        }
      }
    }

    return records;
  }

  /**
   * Returns total of records in storage
   */
  count() {
    this.removeExpired();
    return Object.keys(this._memory.data).length;
  }

  /**
   * Check if record is expired
   */
  expired(key: string) {
    if (this._memory.data[key] && this._memory.data[key].expiresOn) {
      let now = new Date();
      let expiry = new Date(this._memory.data[key].expiresOn);
      return now > expiry;
    } else {
      return false;
    }
  }

  /**
   * Remove all records
   */
  removeall() {
    this._memory.data = {};
  }

  /**
   * Check if key exists
   */
  has(key: string) {
    return this._memory.data.hasOwnProperty(key);
  }

  /**
   * Returns basic stats of storage, eg: {{count: 0, size: 100}}
   */
  stats() {
    return {
      count: this.count(),
      size: sizeOf(this._memory.data),
    };
  }

  /**
   * Check if key can be auto removed
   */
  canBeAutoRemove(key: string) {
    return (
      !this._conf.autoRemoveInterval &&
      this.expired(key) &&
      this._memory.data[key].toDelete
    );
  }
}
