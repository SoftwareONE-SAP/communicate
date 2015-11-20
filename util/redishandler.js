var redis = require("redis");
var expect = require('chai').expect;
var debug = require("debug")("communicate:redis");

var RedisHandler = function(options){
	this.options = options;

	expect(this.options.host).to.be.a('string');
	expect(this.options.port).to.be.a('number');

	this.pubClient = this.createClient();
}

RedisHandler.prototype.createClient = function() {
	// debug("Creating new client...");

	var client = redis.createClient(this.options.port, this.options.host, {});

	client.on("error", function(err) {
        debug("Redis Error!", err);
    });

    return client;
}

RedisHandler.prototype.publish = function(channel, data){
	this.pubClient.publish(channel, data);
}

module.exports = RedisHandler;