var util = require('util');
var EventEmitter = require('events');

var debug = require("debug")("communicate:master");

var CommunicateWorker = function(parent, clusterName) {
    this.parent = parent;
    this.clusterName = clusterName;

    this.init();
}

util.inherits(CommunicateWorker, EventEmitter);

CommunicateWorker.prototype.init = function() {
    this.masterChannel = this.parent.options.redis.masterChannel ? this.parent.options.redis.masterChannel : "communicate-internal@@@master@@@" + this.clusterName;
    this.returnChannel = this.parent.options.redis.returnChannel ? this.parent.options.redis.returnChannel : "communicate-internal@@@return@@@" + this.clusterName;

    /**
     * Connect to redis
     */
    this.masterStream = this.parent.libs.redis.createClient();

    this.masterStream.subscribe(this.masterChannel);

    this.masterStream.on("message", this.onMasterMessage.bind(this));

    this.parent.emit("init", "Registered '" + this.masterChannel + "' as master command redis channel");
};

CommunicateWorker.prototype.onMasterMessage = function(channel, message) {
    this.emit("new-command", JSON.parse(message))
}

CommunicateWorker.prototype.publish = function(command, data) {
    this.parent.libs.redis.publish(this.returnChannel, JSON.stringify({
        command: command,
        data: data
    }));
}

CommunicateWorker.prototype.bindTaskWorker = function(channel, workerFunction){
    this.parent.libs.redis.pubClient.blpop("communicate-internal@@@tasks@@@" + channel, 0, function(err, data){
        if(err){
            debug(err);
            return;
        }

        workerFunction(JSON.parse(data[1]), function(){
            this.bindTaskWorker(channel, workerFunction)
        }.bind(this));
    }.bind(this));
}

module.exports = CommunicateWorker;