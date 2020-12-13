import CacheService from '../src';

describe('clone', function() {
  it('with clone, should return diffrent instance', () => {
    const cache = new CacheService({
      clone: true,
    });
    const val = { a: 1, b: 2 };
    cache.add('key', val);
    let result = cache.fetch('key');
    expect(result === val).toBe(false);
  });

  it('with clone, should return same instance', () => {
    const cache = new CacheService({});
    const val = { a: 1, b: 2 };
    cache.add('key', val);
    let result = cache.fetch('key');
    expect(result).toEqual(val);
  });
});
