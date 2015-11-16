var util = require('util');
var EventEmitter = require('events');

var debug = require("debug")("communicate:master");

var CommunicateMaster = function(parent, clusterName) {
    this.parent = parent;
    this.clusterName = clusterName;

    this.init();
}

util.inherits(CommunicateMaster, EventEmitter);

CommunicateMaster.prototype.init = function() {
    this.masterChannel = this.parent.options.redis.masterChannel ? this.parent.options.redis.masterChannel : "communicate-internal@@@master@@@" + this.clusterName;
    this.returnChannel = this.parent.options.redis.returnChannel ? this.parent.options.redis.returnChannel : "communicate-internal@@@return@@@" + this.clusterName;

    var returnClient = this.parent.libs.redis.createClient();

    returnClient.subscribe(this.returnChannel);

    returnClient.on("message", this.onWorkerMessage.bind(this));

    this.parent.emit("init", "Registered '" + this.masterChannel + "' as master redis channel And registered '" + this.returnChannel + "' as return redis channel");
};

CommunicateMaster.prototype.onWorkerMessage = function(channel, message) {
    this.emit("worker-message", JSON.parse(message))
}

CommunicateMaster.prototype.command = function(command, data) {

    debug("Publishing command...")

    this.parent.libs.redis.publish(this.masterChannel, JSON.stringify({
        command: command,
        data: data
    }));
}

CommunicateMaster.prototype.addTask = function(channel, packet) {
    this.parent.libs.redis.pubClient.lpush("communicate-internal@@@tasks@@@" + channel, JSON.stringify(packet));
}

CommunicateMaster.prototype.clearTasks = function(channel) {
    this.parent.libs.redis.pubClient.del("communicate-internal@@@tasks@@@" + channel);
}

module.exports = CommunicateMaster;