# redis-streams

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]

Extends the official [node_redis](https://www.npmjs.com/package/redis) client with additional functionality to support streaming data into and out of Redis avoiding buffering the entire contents in memory. The real work is powered by the [redis-rstream](https://www.npmjs.com/package/redis-rstream) and [redis-wstream](https://www.npmjs.com/package/redis-wstream) by [@jeffbski](https://github.com/jeffbski).

## Installation
```
npm install redis-streams
```

## Usage
Simply require `redis-streams` and the `RedisClient` prototype receives two additional functions: 

__`readStream(key)`__  - get a [Readable stream](http://nodejs.org/api/stream.html#stream_class_stream_readable) from redis. 

__`writeThrough(key, maxAge)`__  - write to redis and pass the stream through.

See the [unit tests](https://github.com/4front/redis-streams/blob/master/test/redis.js) for usage examples.

### Caching Proxy

A canonical use case is a caching proxy. 

```js
var redis = require('redis').createClient();
var request = require('request');
require('redis-streams');

app.get('/cache/:key', function(req, res, next) {
	redis.exists(req.params.key, function(err, exists) {
	   if (err) return next(err);
	   
		if (exists === 1)
			return redis.readStream(req.params.key).pipe(res);		
		// Cache the remote http call for 60 seconds
		request.get('http://somewhere.com/' + req.params.key)
			.pipe(redis.writeThrough(req.params.key, 60)
			.pipe(res);
	});
});
```

[npm-image]: https://img.shields.io/npm/v/redis-streams.svg?style=flat
[npm-url]: https://npmjs.org/package/redis-streams
[travis-image]: https://img.shields.io/travis/4front/redis-streams.svg?style=flat
[travis-url]: https://travis-ci.org/4front/redis-streams
[coveralls-image]: https://img.shields.io/coveralls/4front/redis-streams.svg?style=flat
[coveralls-url]: https://coveralls.io/r/4front/redis-streams?branch=master
[downloads-image]: https://img.shields.io/npm/dm/redis-streams.svg?style=flat
[downloads-url]: https://npmjs.org/package/redis-streams




