var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ApiManager = require('./ApiManager');
var ApiResult = ApiManager.ApiResult;
var mqtt = require("mqtt");
var mqttrouter = require("mqtt-router");
var BaseConnector = require('./BaseConnector');
var Winston = require('winston');
var MqttAPI = (function (_super) {
    __extends(MqttAPI, _super);
    function MqttAPI(server, port, layerPrefix, keyPrefix) {
        if (port === void 0) { port = 1883; }
        if (layerPrefix === void 0) { layerPrefix = "layers"; }
        if (keyPrefix === void 0) { keyPrefix = "keys"; }
        _super.call(this);
        this.server = server;
        this.port = port;
        this.layerPrefix = layerPrefix;
        this.keyPrefix = keyPrefix;
        this.isInterface = true;
        this.receiveCopy = false;
    }
    MqttAPI.prototype.init = function (layerManager, options, callback) {
        var _this = this;
        this.manager = layerManager;
        this.layerPrefix = (this.manager.namespace + "/" + this.layerPrefix + "/").replace("//", "/");
        this.keyPrefix = (this.manager.namespace + "/" + this.keyPrefix + "/").replace("//", "/");
        Winston.info('mqtt: init mqtt connector on address ' + 'mqtt://' + this.server + ':' + this.port);
        this.client = mqtt.connect("mqtt://" + this.server + ":" + this.port);
        this.router = mqttrouter.wrap(this.client);
        this.client.on('error', function (e) {
            Winston.error("mqtt: error " + e);
        });
        this.client.on('connect', function () {
            Winston.info("mqtt: connected");
            if (!_this.manager.isClient) {
                var subscriptions = layerManager.options.mqttSubscriptions || '#';
                Winston.info("mqtt: listen to " + (subscriptions === '#' ? 'everything' : subscriptions));
                if (typeof subscriptions === 'string') {
                    _this.client.subscribe(subscriptions);
                }
                else {
                    subscriptions.forEach(function (s) { return _this.client.subscribe(s); });
                }
            }
        });
        this.client.on('reconnect', function () {
            Winston.debug("mqtt: reconnecting");
        });
        this.client.on('message', function (topic, message) {
            if (topic === _this.layerPrefix) {
                var layer = _this.extractLayer(message);
                if (layer && layer.id) {
                    Winston.info("mqtt: received definition for layer " + layer.id + " on topic " + topic);
                    Winston.info("Definition: " + JSON.stringify(layer, null, 2));
                    _this.manager.addUpdateLayer(layer, { source: _this.id }, function () { });
                }
            }
            else if (topic.indexOf(_this.layerPrefix) === 0) {
                var ids = topic.substring(_this.layerPrefix.length, topic.length).split('/feature/');
                var layerId = ids[0];
                if (ids.length === 1) {
                    try {
                        var layer = _this.extractLayer(message);
                        if (layer) {
                            Winston.info("mqtt: update layer " + layerId + " on topic " + topic);
                            _this.manager.addUpdateLayer(layer, { source: _this.id }, function () { });
                        }
                    }
                    catch (e) {
                        Winston.error("mqtt: error updating layer, exception " + e);
                    }
                }
                else {
                    try {
                        var featureId = ids[1];
                        var feature = JSON.parse(message);
                        if (feature) {
                            Winston.info("mqtt: update feature " + featureId + " for layer " + layerId + " on topic " + topic + ".");
                            _this.manager.updateFeature(layerId, feature, { source: _this.id }, function () { });
                        }
                    }
                    catch (e) {
                        Winston.error("mqtt: error updating feature, exception " + e);
                    }
                }
            }
            else if (topic.indexOf(_this.keyPrefix) === 0) {
                var kid = topic.substring(_this.keyPrefix.length, topic.length).replace(/\//g, '.');
                if (kid) {
                    try {
                        var obj = JSON.parse(message);
                        _this.manager.updateKey(kid, obj, { source: _this.id }, function () { });
                    }
                    catch (e) {
                        Winston.error("mqtt: error updating key for id " + kid + ": " + message + ". Error " + e);
                    }
                }
            }
        });
        callback();
    };
    MqttAPI.prototype.extractLayer = function (message) {
        var layer = JSON.parse(message);
        if (layer.server)
            delete layer.storage;
        return layer;
    };
    MqttAPI.prototype.subscribeKey = function (keyPattern, meta, callback) {
        Winston.info('subscribing key : ' + keyPattern);
        this.router.subscribe(keyPattern, function (topic, message, params) {
            callback(topic, message.toString(), params);
        });
    };
    MqttAPI.prototype.addLayer = function (layer, meta, callback) {
        this.updateLayer(layer, meta, callback);
    };
    MqttAPI.prototype.addFeature = function (layerId, feature, meta, callback) {
        if (meta.source !== this.id) {
            this.client.publish("" + this.layerPrefix + layerId + "/feature/" + feature.id, JSON.stringify(feature));
        }
        callback({ result: ApiResult.OK });
    };
    MqttAPI.prototype.updateLayer = function (layer, meta, callback) {
        Winston.info('mqtt: update layer ' + layer.id);
        if (meta.source !== this.id) {
            var def = this.manager.getLayerDefinition(layer);
            delete def.storage;
            this.client.publish(this.layerPrefix, JSON.stringify(def));
            this.client.publish(this.layerPrefix + layer.id, JSON.stringify(layer));
        }
        callback({ result: ApiResult.OK });
    };
    MqttAPI.prototype.updateFeature = function (layerId, feature, useLog, meta, callback) {
        Winston.info('mqtt update feature');
        if (meta.source !== this.id)
            this.client.publish("" + this.layerPrefix + layerId + "/feature/" + feature.id, JSON.stringify(feature));
        callback({ result: ApiResult.OK });
    };
    MqttAPI.prototype.sendFeature = function (layerId, featureId) {
        var _this = this;
        this.manager.findFeature(layerId, featureId, function (r) {
            if (r.result === ApiResult.OK) {
                _this.client.publish(_this.layerPrefix + layerId, JSON.stringify(r.feature));
            }
        });
    };
    MqttAPI.prototype.updateProperty = function (layerId, featureId, property, value, useLog, meta, callback) {
        this.sendFeature(layerId, featureId);
        callback({ result: ApiResult.OK });
    };
    MqttAPI.prototype.updateLogs = function (layerId, featureId, logs, meta, callback) {
        this.sendFeature(layerId, featureId);
        callback({ result: ApiResult.OK });
    };
    MqttAPI.prototype.initLayer = function (layer) {
        Winston.info('mqtt: init layer ' + layer.id);
    };
    MqttAPI.prototype.getKeyChannel = function (keyId) {
        return this.keyPrefix + keyId.replace(/[\.]/g, "/");
    };
    MqttAPI.prototype.updateKey = function (keyId, value, meta, callback) {
        this.client.publish(this.getKeyChannel(keyId), JSON.stringify(value));
    };
    return MqttAPI;
})(BaseConnector.BaseConnector);
exports.MqttAPI = MqttAPI;
//# sourceMappingURL=MqttAPI.js.map