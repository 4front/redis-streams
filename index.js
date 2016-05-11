var crypto = require('crypto');
var redisWStream = require('redis-wstream');
var redisRStream = require('redis-rstream');
var through2 = require('through2');

module.exports = function(redis) {
  redis.RedisClient.prototype.writeThrough = function(key, maxAge) {
    var self = this;
    var tempSuffix = crypto.randomBytes(15).toString('base64');
    var redisStream = redisWStream(this, key, { tempKeySuffix: tempSuffix });

    return through2.obj(function(chunk, enc, callback) {
      var out = this;

      redisStream._write(chunk, enc, function() {
        // https://github.com/jeffbski/digest-stream/blob/master/lib/digest-stream.js#L13
        out.push(chunk);
        callback();
      });
    }, function(cb) {
      redisStream.end(function() {
        // Set the expiry of the cache entry. Need to do this in the callback
        // to ensure that the key was renamed to the actual value.
        if (maxAge) self.expire(key, maxAge);

        // Delete the temp key in case it is still there. This shouldn't be necessary,
        // the redis-wstream is supposed to rename the key
        self.del(key + tempSuffix);
        cb();
      });
    });
  };

  redis.RedisClient.prototype.writeStream = function(key, maxAge) {
    var self = this;
    var tempSuffix = crypto.randomBytes(15).toString('base64');

    return redisWStream(this, key, {tempKeySuffix: tempSuffix})
      .on('finish', function() {
        if (maxAge) self.expire(key, maxAge);
        self.del(key + tempSuffix);
      });
  };

  redis.RedisClient.prototype.readStream = function(key) {
    return redisRStream(this, key);
  };
};
