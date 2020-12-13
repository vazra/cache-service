import CacheService from '../src';

describe('remove on expire', function() {
  it('expired items to be auto removed ', done => {
    const cache = new CacheService({
      maxLife: 500,
      autoRemoveInterval: 1,
    });
    cache.add('key', 'val');
    setTimeout(function() {
      expect(cache.count()).toBe(0);
      done();
    }, 1500);
  });

  it('expired items to be removed on fetch', done => {
    const cache = new CacheService({
      maxLife: 1000,
    });
    cache.add('key', 'val');
    setTimeout(function() {
      cache.fetch('key');
      expect(cache.count()).toBe(0);
      done();
    }, 1500);
  });
});
