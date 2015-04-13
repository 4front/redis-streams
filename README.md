# redis-streams

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Build Status][travis-image]][travis-url]
[![Test Coverage][coveralls-image]][coveralls-url]

Extends the official [node_redis](https://www.npmjs.com/package/redis) client with additional functionality to support streaming data into and out of Redis avoiding buffering the entire contents in memory. The real work is powered by the [redis-rstream](https://www.npmjs.com/package/redis-rstream) and [redis-wstream](https://www.npmjs.com/package/redis-wstream) by [@jeffbski](https://github.com/jeffbski).

## Installation
```
npm install redis-streams
```

## Usage

```js
var redis = require('redis');
require('redis-streams')(redis);
```

This will extend the `RedisClient` prototype with two additional functions:

__`readStream(key)`__  - get a [Readable stream](http://nodejs.org/api/stream.html#stream_class_stream_readable) from redis.

__`writeStream(key, maxAge)`__ - get a [Writable stream](https://nodejs.org/api/stream.html#stream_class_stream_writable) from redis.

__`writeThrough(key, maxAge)`__  - write to redis and pass the stream through.

```js
var redis = require('redis');
require('redis-streams')(redis);

var redisClient = redis.createClient();

redisClient.readStream(key)
	.pipe(process.stdout);

fs.createReadStream('file.txt')
	.pipe(redisClient.writeStream(key, maxAge))
	.on('finish', done);

fs.createReadStream('file.txt')
	.pipe(redisClient.writeThrough(key, maxAge))
	.pipe(process.stdout);
```
See the [unit tests](https://github.com/4front/redis-streams/blob/master/test/redis.js) for additional usage examples.


#### Caching Proxy
You could also implement a Connect caching proxy middleware.

```js
var redis = require('redis');
var request = require('request');
require('redis-streams')(redis);

var redisClient = redis.createClient();

app.get('/cache/:key', function(req, res, next) {
	redis.exists(req.params.key, function(err, exists) {
	   if (err) return next(err);

		if (exists)
			return redis.readStream(req.params.key).pipe(res);

		// Cache the remote http call for 60 seconds
		request.get('http://somewhere.com/' + req.params.key)
			.pipe(redis.writeThrough(req.params.key, 60))
			.pipe(res);
	});
});
```

The [express-api-proxy](https://github.com/4front/express-api-proxy) module utilizes `redis-streams` for this purpose, but in a more advanced way.

[npm-image]: https://img.shields.io/npm/v/redis-streams.svg?style=flat
[npm-url]: https://npmjs.org/package/redis-streams
[travis-image]: https://img.shields.io/travis/4front/redis-streams.svg?style=flat
[travis-url]: https://travis-ci.org/4front/redis-streams
[coveralls-image]: https://img.shields.io/coveralls/4front/redis-streams.svg?style=flat
[coveralls-url]: https://coveralls.io/r/4front/redis-streams?branch=master
[downloads-image]: https://img.shields.io/npm/dm/redis-streams.svg?style=flat
[downloads-url]: https://npmjs.org/package/redis-streams
