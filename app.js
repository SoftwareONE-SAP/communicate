var util = require('util');
var EventEmitter = require('events');

var debug = require("debug")("communicate:main");
var should = require('chai').should();
var redishandler = require('./util/redishandler.js');
var communicatemaster = require('./util/master.js');
var communicateworker = require('./util/worker.js');

var Communcate = function(options) {
    this.options = options;
    this.libs = {};

    this.init()
}

util.inherits(Communcate, EventEmitter);

Communcate.prototype.init = function() {
    // debug("initializing...");

    should.exist(this.options.redis);

    this.libs.redis = new redishandler(this.options.redis);

    this.master = function(clusterName) {
        return new communicatemaster(this, clusterName);
    }

    this.worker = function(clusterName) {
        return new communicateworker(this, clusterName);
    }

}

module.exports = Communcate;