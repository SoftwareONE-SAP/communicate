var debug = require("debug")("communicate:master");

var CommunicateMaster = function(parent, clusterName){
	this.parent = parent;
	this.clusterName = clusterName;

	// debug(this);

	this.init();
}

CommunicateMaster.prototype.init = function() {
	this.commandChannel = this.parent.options.redis.masterChannel ? this.parent.options.redis.masterChannel : "communicate-internal@@@master@@@" + this.clusterName;

	this.commandStream = this.parent.libs.redis.createClient();

	this.commandStream.subscribe(this.commandChannel);

	this.commandStream.on("message", this.onMasterMessage.bind(this));

	this.parent.emit("init", "Registered '" + this.commandChannel + "' as master command redis channel");
};

CommunicateMaster.prototype.onMasterMessage = function(channel, message){
	this.parent.emit("new-command", message)
}

module.exports = CommunicateMaster;