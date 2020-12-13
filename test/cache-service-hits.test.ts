import CacheService from '../src';

describe('hits', function() {
  it('should increment by fetch', () => {
    const cache = new CacheService({});

    let record = cache.add(`key`, `val`);

    expect(record.hits).toBe(0);
    expect(record.lastHit).toBeUndefined;

    cache.fetch(`key`);
    record = cache.info(`key`);

    expect(record.hits).toBe(1);
    expect(typeof record.lastHit).toBe('object');

    cache.fetch(`key`);
    record = cache.info(`key`);

    expect(record.hits).toBe(2);
  });
});
