var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ApiManager = require('./ApiManager');
var ApiResult = ApiManager.ApiResult;
var ClientConnection = require('./../dynamic/ClientConnection');
var BaseConnector = require('./BaseConnector');
var Winston = require('winston');
var ImbAPI = (function (_super) {
    __extends(ImbAPI, _super);
    function ImbAPI(server, port, layerPrefix, keyPrefix) {
        if (port === void 0) { port = 1883; }
        if (layerPrefix === void 0) { layerPrefix = "layers"; }
        if (keyPrefix === void 0) { keyPrefix = "keys"; }
        _super.call(this);
        this.server = server;
        this.port = port;
        this.layerPrefix = layerPrefix;
        this.keyPrefix = keyPrefix;
        this.imb = require('./imb.js');
        this.isInterface = true;
        this.receiveCopy = false;
        this.imbConnection = new this.imb.TIMBConnection();
    }
    ImbAPI.prototype.init = function (layerManager, options) {
        var _this = this;
        this.manager = layerManager;
        this.layerPrefix = (this.manager.namespace + "/" + this.layerPrefix + "/").replace("//", "/");
        this.keyPrefix = (this.manager.namespace + "/" + this.keyPrefix + "/").replace("//", "/");
        Winston.info('imb: init imb connector');
        this.imbConnection.connect(this.server, this.port, 1234, 'CSweb', 'USIdle');
        this.layersEvent = this.imbConnection.subscribe('CSweb.layers', true);
        this.layersEvent.onNormalEvent = function (eventDefinition, aEventPayload) {
            var cmd = aEventPayload.readInt32LE(0);
            var layerIDLen = aEventPayload.readInt32LE(4);
            var layerID = aEventPayload.toString("utf8", 8, 8 + layerIDLen);
            switch (cmd) {
                case ClientConnection.LayerUpdateAction.updateLayer:
                    var layer = { storage: "file", type: "geojson", id: layerID, title: layerID };
                    _this.manager.addUpdateLayer(layer, { source: _this.id, user: "US" }, function () { });
                    var layerEvent = _this.imbConnection.subscribe(eventDefinition.name + "." + layerID);
                    layerEvent.onNormalEvent = function (eventDefinition, aEventPayload) {
                        var cmd = aEventPayload.readInt32LE(0);
                        var valueLen = aEventPayload.readInt32LE(4);
                        var value = aEventPayload.toString("utf8", 8, 8 + valueLen);
                        switch (cmd) {
                            case ClientConnection.LayerUpdateAction.updateFeature:
                                _this.manager.updateFeature(layerID, JSON.parse(value), { source: _this.id, user: "US" }, function () { });
                                break;
                            case ClientConnection.LayerUpdateAction.deleteFeature:
                                _this.manager.deleteFeature(layerID, value, { source: _this.id, user: "US" }, function () { });
                                break;
                            case ClientConnection.LayerUpdateAction.updateLayer:
                                _this.manager.addUpdateLayer(JSON.parse(value), { source: _this.id, user: "US" }, function () { });
                                break;
                        }
                    };
                    break;
                case ClientConnection.LayerUpdateAction.deleteLayer:
                    _this.manager.deleteLayer(layerID, { source: _this.id, user: "US" }, function () { });
                    eventDefinition.unsubscribe();
                    eventDefinition.unPublish();
                    break;
            }
        };
        this.keysEvent = this.imbConnection.subscribe('CSweb.keys', true);
        this.keysEvent.onNormalEvent = function (eventDefinition, aEventPayload) {
            var cmd = aEventPayload.readInt32LE(0);
            var keyIDLen = aEventPayload.readInt32LE(4);
            var keyID = aEventPayload.toString("utf8", 8, 8 + keyIDLen);
            switch (cmd) {
                case ClientConnection.KeyUpdateAction.updateKey:
                    var keyEvent = _this.imbConnection.subscribe(eventDefinition.name + "." + keyID);
                    keyEvent.onNormalEvent = function (eventDefinition, aEventPayload) {
                        var cmd = aEventPayload.readInt32LE(0);
                        var valueLen = aEventPayload.readInt32LE(4);
                        var value = aEventPayload.toString("utf8", 8, 8 + valueLen);
                        switch (cmd) {
                            case ClientConnection.KeyUpdateAction.updateKey:
                                Winston.error("value " + value);
                                _this.manager.updateKey(keyID, JSON.parse(value.toString()), { source: _this.id, user: "US" }, function () { });
                                break;
                        }
                    };
                    break;
                case ClientConnection.LayerUpdateAction.deleteLayer:
                    eventDefinition.unsubscribe();
                    eventDefinition.unPublish();
                    break;
            }
        };
    };
    ImbAPI.prototype.buildCmdValue = function (cmd, value) {
        var valueByteLength = Buffer.byteLength(value);
        var payload = new Buffer(8 + valueByteLength);
        payload.writeInt32LE(cmd, 0);
        payload.writeInt32LE(valueByteLength, 4);
        payload.write(value, 8);
        return payload;
    };
    ImbAPI.prototype.addFeature = function (layerId, feature, meta, callback) {
        if (meta.source != this.id) {
            this.imbConnection.publish("layers." + layerId).normalEvent(ekNormalEvent, this.buildCmdValue(ClientConnection.LayerUpdateAction.updateFeature, JSON.stringify(feature)));
        }
        callback({ result: ApiResult.OK });
    };
    ImbAPI.prototype.updateFeature = function (layerId, feature, useLog, meta, callback) {
        if (meta.source != this.id) {
            this.imbConnection.publish("layers." + layerId).normalEvent(ekNormalEvent, this.buildCmdValue(ClientConnection.LayerUpdateAction.updateFeature, JSON.stringify(feature)));
        }
        callback({ result: ApiResult.OK });
    };
    ImbAPI.prototype.deleteFeature = function (layerId, featureId, meta, callback) {
        if (meta.source != this.id) {
            this.imbConnection.publish("layers." + layerId).normalEvent(ekNormalEvent, this.buildCmdValue(ClientConnection.LayerUpdateAction.deleteFeature, featureId));
        }
        callback({ result: ApiResult.OK });
    };
    ImbAPI.prototype.updateKey = function (keyId, value, meta, callback) {
        if (meta.source != this.id) {
            this.imbConnection.publish("keys." + keyId).normalEvent(ekNormalEvent, this.buildCmdValue(ClientConnection.KeyUpdateAction.updateKey, keyId));
        }
        callback({ result: ApiResult.OK });
    };
    ImbAPI.prototype.deleteKey = function (keyId, meta, callback) {
        if (meta.source != this.id) {
            this.imbConnection.publish("keys").normalEvent(ekNormalEvent, this.buildCmdValue(ClientConnection.KeyUpdateAction.deleteKey, keyId));
        }
        callback({ result: ApiResult.OK });
    };
    return ImbAPI;
})(BaseConnector.BaseConnector);
exports.ImbAPI = ImbAPI;
//# sourceMappingURL=ImbAPI.js.map