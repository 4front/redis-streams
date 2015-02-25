var redis = require('redis');
var stream = require('stream');
var assert = require('assert');

require('..');

describe('redis-streams', function() {
  var redisClient = redis.createClient();
  var key = "redis-stream-test-key";

  afterEach(function() {
    redisClient.del(key);
  });

  it('readStream()', function(done) {
    var contents = "SIDHFJOSKDHFJKSDHFNJKSDHF";
    redisClient.set(key, contents);

    var out = '';
    redisClient.readStream(key).on('data', function(chunk) {
      out += chunk;
    }).on('end', function() {
      assert.equal(out, contents);
      done();
    });
  });

  it('writeThrough()', function(done) {
    var contents = "OISHFIOSHFIOSHDFIOSDFH";

    var rs = stream.Readable();
    rs._read = function () {
      rs.push(contents);
      rs.push(null);
    };

    var out = '';
    rs.pipe(redisClient.writeThrough(key, 10)).on('data', function(chunk) {
      out += chunk;
    }).on('end', function() {
      assert.equal(contents, out);

      redisClient.get(key, function(err, cachedValue) {
        if (err) return done(err);

        assert.equal(cachedValue, contents);
        done();
      });
    }); 
  });
});