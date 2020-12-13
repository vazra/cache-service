import CacheService from '../src';

const cache = new CacheService({});

describe('cache-service', () => {
  describe('add', function() {
    it('should set the value', () => {
      cache.add('key', 'val');
      let result = cache.fetch('key');
      expect(result).toEqual('val');
    });
    it('with maxLife, should expire on time', done => {
      cache.add('expKey', 'val', {
        maxLife: 1000,
      });
      setTimeout(() => {
        let result = cache.fetch('expKey');
        expect(result).toBeUndefined();
        done();
      }, 1200);
    });
    it('should update value if already exists', () => {
      let result;
      result = cache.add('keyKL', 'val');
      expect(result.isNew).toBe(true);
      result = cache.add('keyKL', 'newVal');
      expect(result.isNew).toBe(false);

      result = cache.fetch('keyKL');
    });
  });

  describe('fetch, not found', function() {
    it('should return undefined when not found', () => {
      let result = cache.fetch('invalidkey');
      expect(result).toBeUndefined;
    });
  });

  describe('has', function() {
    it('should return true, if key exists', () => {
      cache.add('key', 'val');
      let result = cache.has('key');
      expect(result).toBe(true);
    });
    it('should return false, if key does not exists', () => {
      let result = cache.has('NoKey');
      expect(result).toBe(false);
    });
  });

  describe('remove', function() {
    it('should return false', () => {
      cache.add('keyR', 'val');
      let result = cache.has('keyR');
      expect(result).toBe(true);
      cache.remove('keyR');
      result = cache.has('keyR');
      expect(result).toBe(false);
    });
  });

  describe('removeExpired', function() {
    it('should return false', done => {
      cache.add('ExpKey', 'val', { maxLife: 500 });
      cache.add('ExpKey2', 'val');
      cache.add('ExpKey3', 'val', { maxLife: 500 });
      setTimeout(function() {
        cache.removeExpired();
        expect(cache.has('ExpKey')).toBe(false);
        expect(cache.has('ExpKey2')).toBe(true);
        expect(cache.has('ExpKey3')).toBe(false);
        done();
      }, 1000);
    });
  });

  describe('fetchall', function() {
    it('should return an array of all items', () => {
      cache.removeall();
      cache.add('key1', 'val1');
      cache.add('key2', 'val2');
      cache.add('key3', 'val3');
      let result = cache.fetchall();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(3);
    });

    it('with expired, should return an array of non expired items', done => {
      cache.removeall();
      cache.add('key1', 'val1');
      cache.add('key2', 'val2');
      cache.add('key3', 'val3');
      cache.add('key4', 'val4', { maxLife: 1000 });
      setTimeout(() => {
        const result = cache.fetchall();
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(3);
        done();
      }, 1500);
    });
  });

  describe('removeall', function() {
    it('should clear all items', () => {
      cache.removeall();
      cache.add('key1', 'val1');
      cache.add('key2', 'val2');
      cache.add('key3', 'val3');
      const result = cache.fetchall();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(3);

      cache.removeall();
      const result1 = cache.fetchall();
      expect(Array.isArray(result1)).toBe(true);
      expect(result1.length).toBe(0);
    });
  });

  describe('expired', function() {
    it('should return true when expired (with maxLife)', done => {
      cache.add('key1', 'val', {
        maxLife: 1000,
      });
      setTimeout(() => {
        expect(cache.expired('key1')).toBe(true);
        done();
      }, 2000);
    });
    it('should return true when expired (with expires)', done => {
      let now = new Date();
      now = new Date(now.setSeconds(now.getSeconds() + 1));
      cache.add('key2', 'val', {
        expires: now,
      });
      setTimeout(() => {
        expect(cache.expired('key2')).toBe(true);
        done();
      }, 2000);
    });

    it('key not found, should return false', () => {
      expect(cache.expired('key-na')).toBe(false);
    });
  });
});
