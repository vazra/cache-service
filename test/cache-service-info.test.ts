import CacheService from '../src';

describe('cache-info', function() {
  it('should not increment hits with info call', () => {
    const cache = new CacheService({});

    let record = cache.add(`key`, `val`);
    expect(record.hits).toBe(0);
    expect(record.lastHit).toBe(undefined);
    cache.fetch(`key`);

    record = cache.info(`key`);
    expect(record.hits).toBe(1);
    expect(typeof record.lastHit).toBe('object');

    record = cache.info(`key`);
    expect(record.hits).toBe(1);
    expect(record.lastHit).toBeUndefined;
  });
});
