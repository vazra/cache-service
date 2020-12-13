import CacheService from '../src';

describe('stats', function() {
  it('should return stat object with count', () => {
    const cache = new CacheService({});
    for (let i = 0; i < 2000; i++) cache.add(`key${i}`, `val${i}`);

    let result = cache.stats();
    expect(result.count).toBe(2000);
  });
});
