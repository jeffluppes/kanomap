var io = require('socket.io');
var Winston = require('winston');
var MsgSubscription = (function () {
    function MsgSubscription() {
    }
    return MsgSubscription;
})();
exports.MsgSubscription = MsgSubscription;
var ProjectSubscription = (function () {
    function ProjectSubscription() {
    }
    return ProjectSubscription;
})();
exports.ProjectSubscription = ProjectSubscription;
var LayerSubscription = (function () {
    function LayerSubscription() {
    }
    return LayerSubscription;
})();
exports.LayerSubscription = LayerSubscription;
var KeySubscription = (function () {
    function KeySubscription() {
    }
    return KeySubscription;
})();
exports.KeySubscription = KeySubscription;
var ProjectUpdate = (function () {
    function ProjectUpdate() {
    }
    return ProjectUpdate;
})();
exports.ProjectUpdate = ProjectUpdate;
var LayerUpdate = (function () {
    function LayerUpdate() {
    }
    return LayerUpdate;
})();
exports.LayerUpdate = LayerUpdate;
var KeyUpdate = (function () {
    function KeyUpdate() {
    }
    return KeyUpdate;
})();
exports.KeyUpdate = KeyUpdate;
(function (ProjectUpdateAction) {
    ProjectUpdateAction[ProjectUpdateAction["updateProject"] = 0] = "updateProject";
    ProjectUpdateAction[ProjectUpdateAction["deleteProject"] = 1] = "deleteProject";
})(exports.ProjectUpdateAction || (exports.ProjectUpdateAction = {}));
var ProjectUpdateAction = exports.ProjectUpdateAction;
(function (LayerUpdateAction) {
    LayerUpdateAction[LayerUpdateAction["updateFeature"] = 0] = "updateFeature";
    LayerUpdateAction[LayerUpdateAction["updateLog"] = 1] = "updateLog";
    LayerUpdateAction[LayerUpdateAction["deleteFeature"] = 2] = "deleteFeature";
    LayerUpdateAction[LayerUpdateAction["updateLayer"] = 3] = "updateLayer";
    LayerUpdateAction[LayerUpdateAction["deleteLayer"] = 4] = "deleteLayer";
})(exports.LayerUpdateAction || (exports.LayerUpdateAction = {}));
var LayerUpdateAction = exports.LayerUpdateAction;
(function (KeyUpdateAction) {
    KeyUpdateAction[KeyUpdateAction["updateKey"] = 0] = "updateKey";
    KeyUpdateAction[KeyUpdateAction["deleteKey"] = 1] = "deleteKey";
})(exports.KeyUpdateAction || (exports.KeyUpdateAction = {}));
var KeyUpdateAction = exports.KeyUpdateAction;
var ClientMessage = (function () {
    function ClientMessage(action, data) {
        this.action = action;
        this.data = data;
    }
    return ClientMessage;
})();
exports.ClientMessage = ClientMessage;
var WebClient = (function () {
    function WebClient(Client) {
        this.Client = Client;
        this.Subscriptions = {};
    }
    WebClient.prototype.FindSubscription = function (target, type) {
        for (var k in this.Subscriptions) {
            if ((this.Subscriptions[k].type === "key" && type === "key" && this.Subscriptions[k].id === target)
                || (this.Subscriptions[k].regexPattern.test(target) && this.Subscriptions[k].type === type))
                return this.Subscriptions[k];
        }
        return null;
    };
    WebClient.prototype.Subscribe = function (sub) {
        var _this = this;
        sub.regexPattern = new RegExp(sub.target.replace(/\//g, "\\/").replace(/\./g, "\\."));
        this.Subscriptions[sub.id] = sub;
        this.Client.on(sub.id, function (data) {
            switch (data.action) {
                case "unsubscribe":
                    Winston.info('clientconnection: unsubscribed (' + sub.id + ")");
                    delete _this.Subscriptions[sub.id];
                    break;
            }
        });
        this.Client.emit(sub.id, new ClientMessage("subscribed", ""));
        Winston.info('clientconnection: subscribed to : ' + sub.target + " (" + sub.id + " : " + sub.type + ")");
    };
    return WebClient;
})();
exports.WebClient = WebClient;
var ConnectionManager = (function () {
    function ConnectionManager(httpServer) {
        var _this = this;
        this.users = {};
        this.msgSubscriptions = [];
        this.server = io(httpServer);
        this.server.on('connection', function (socket) {
            Winston.warn('clientconnection: user ' + socket.id + ' has connected');
            var wc = new WebClient(socket);
            _this.users[socket.id] = wc;
            socket.on('disconnect', function (s) {
                delete _this.users[socket.id];
                Winston.info('clientconnection: user ' + socket.id + ' disconnected');
            });
            socket.on('subscribe', function (msg) {
                Winston.info('clientconnection: subscribe ' + JSON.stringify(msg.target) + " - " + socket.id);
                wc.Subscribe(msg);
            });
            socket.on('msg', function (msg) {
                _this.checkClientMessage(msg, socket.id);
            });
        });
    }
    ConnectionManager.prototype.checkClientMessage = function (msg, client) {
        this.msgSubscriptions.forEach(function (sub) {
            if (sub.target === msg.action) {
                sub.callback(msg, client);
            }
        });
    };
    ConnectionManager.prototype.registerProject = function (projectId, callback) {
        var sub = new ProjectSubscription();
        sub.projectId = projectId;
        sub.callback = callback;
    };
    ConnectionManager.prototype.registerLayer = function (layerId, callback) {
        var sub = new LayerSubscription();
        sub.layerId = layerId;
        sub.callback = callback;
    };
    ConnectionManager.prototype.subscribe = function (on, callback) {
        var cs = new MsgSubscription();
        cs.target = on;
        cs.regexPattern = new RegExp(on.replace(/\//g, "\\/").replace(/\./g, "\\."));
        cs.callback = callback;
        this.msgSubscriptions.push(cs);
    };
    ConnectionManager.prototype.updateSensorValue = function (sensor, date, value) {
        for (var uId in this.users) {
            for (var s in this.users[uId].Subscriptions) {
                var sub = this.users[uId].Subscriptions[s];
                if (sub.type == "sensor" && sub.target == sensor) {
                    var cm = new ClientMessage("sensor-update", [{ sensor: sensor, date: date, value: value }]);
                    this.users[uId].Client.emit(sub.id, cm);
                }
            }
        }
    };
    ConnectionManager.prototype.publish = function (key, type, command, object) {
        for (var uId in this.users) {
            var sub = this.users[uId].FindSubscription(key, type);
            if (sub != null) {
                Winston.info('sending update:' + sub.id);
                this.users[uId].Client.emit(sub.id, new ClientMessage(command, object));
            }
        }
    };
    ConnectionManager.prototype.updateDirectory = function (layer) {
    };
    ConnectionManager.prototype.updateProject = function (projectId, update, meta) {
        var skip = (meta.source === "socketio") ? meta.user : undefined;
        for (var uId in this.users) {
            if (!skip || uId != skip) {
                var sub = this.users[uId].FindSubscription("", "directory");
                if (sub != null) {
                    this.users[uId].Client.emit(sub.id, new ClientMessage("project", update));
                }
            }
        }
    };
    ConnectionManager.prototype.updateFeature = function (layerId, update, meta) {
        var skip = (meta.source === "socketio") ? meta.user : undefined;
        for (var uId in this.users) {
            if (!skip || uId != skip) {
                var sub = this.users[uId].FindSubscription(layerId, "layer");
                if (sub != null) {
                    this.users[uId].Client.emit(sub.id, new ClientMessage("layer", update));
                }
            }
        }
    };
    ConnectionManager.prototype.updateLayer = function (layerId, update, meta) {
        var skip = (meta.source === "socketio") ? meta.user : undefined;
        for (var uId in this.users) {
            if (!skip || uId != skip) {
                var sub = this.users[uId].FindSubscription("", "directory");
                if (sub != null) {
                    this.users[uId].Client.emit(sub.id, new ClientMessage("layer", update));
                }
            }
        }
    };
    ConnectionManager.prototype.updateKey = function (keyId, update, meta) {
        var skip = (meta.source === "socketio") ? meta.user : undefined;
        for (var uId in this.users) {
            if (!skip || uId != skip) {
                var sub = this.users[uId].FindSubscription(keyId, "key");
                if (sub != null) {
                    this.users[uId].Client.emit(sub.id, new ClientMessage("key", update));
                }
            }
        }
    };
    return ConnectionManager;
})();
exports.ConnectionManager = ConnectionManager;
//# sourceMappingURL=ClientConnection.js.map