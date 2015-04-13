var redis = require('redis');
var stream = require('stream');
var assert = require('assert');
var sbuff = require('simple-bufferstream');
var loremIpsum = require('lorem-ipsum');
require('..')(redis);

describe('redis-streams', function() {
  var redisClient = redis.createClient();

  var key = "redis-stream-test-key";

  afterEach(function() {
    redisClient.del(key);
  });

  it('readStream()', function(done) {
    var contents = loremIpsum();
    redisClient.set(key, contents);

    var out = '';
    redisClient.readStream(key)
      .on('data', function(chunk) {
        out += chunk;
      })
      .on('end', function() {
        assert.equal(out, contents);
        done();
      });
  });

  it('writeStream()', function(done) {
    var contents = loremIpsum();

    sbuff(contents).pipe(redisClient.writeStream(key, 10))
      .on('finish', function() {
        redisClient.get(key, function(err, cachedValue) {
          assert.equal(cachedValue, contents);

          redisClient.ttl(key, function(err, ttl) {
            assert.equal(ttl, 10);
            done();
          })
        });
      });
  });

  it('writeThrough()', function(done) {
    var contents = loremIpsum();

    var out = '';
    sbuff(contents).pipe(redisClient.writeThrough(key, 10))
      .on('data', function(chunk) {
        out += chunk;
      })
      .on('end', function() {
        assert.equal(out, contents);

        redisClient.get(key, function(err, cachedValue) {
          if (err) return done(err);

          assert.equal(cachedValue, contents);
          done();
        });
      });
  });
});
