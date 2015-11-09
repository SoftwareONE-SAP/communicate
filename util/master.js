var debug = require("debug")("communicate:master");

var CommunicateMaster = function(parent, clusterName){
	this.parent = parent;
	this.clusterName = clusterName;

	// debug(this);

	this.init();
}

CommunicateMaster.prototype.init = function() {
	this.masterChannel = this.parent.options.redis.masterChannel ? this.parent.options.redis.masterChannel : "communicate-internal@@@master@@@" + this.clusterName;
	this.returnChannel = this.parent.options.redis.returnChannel ? this.parent.options.redis.returnChannel : "communicate-internal@@@return@@@" + this.clusterName;

	var returnClient = this.parent.libs.redis.createClient();

	returnClient.subscribe(this.returnChannel);

	returnClient.on("message", this.onWorkerMessage);

	this.parent.emit("init", "Registered '" + this.masterChannel + "' as master redis channel And registered '" + this.returnChannel + "' as return redis channel");
};

CommunicateMaster.prototype.onWorkerMessage = function(message){
	debug("Worker message...");
	debug(message);
}

CommunicateMaster.prototype.publish = function(command, data){
	this.parent.libs.redis.publish(this.masterChannel, JSON.stringify({
		command: command,
		data: data
	}));
}

module.exports = CommunicateMaster;