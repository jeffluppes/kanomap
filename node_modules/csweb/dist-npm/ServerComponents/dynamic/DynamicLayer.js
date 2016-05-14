var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var events = require('events');
var fs = require('fs');
var utils = require('../helpers/Utils');
var ApiManager = require('../api/ApiManager');
var Layer = ApiManager.Layer;
var DynamicLayer = (function (_super) {
    __extends(DynamicLayer, _super);
    function DynamicLayer(manager, layerId, file, server, messageBus, connection) {
        _super.call(this);
        this.manager = manager;
        this.layerId = layerId;
        this.geojson = new Layer();
        this.file = file;
        this.server = server;
        this.messageBus = messageBus;
        this.connection = connection;
    }
    DynamicLayer.prototype.getLayer = function (req, res) {
        res.send(JSON.stringify(this.geojson));
    };
    DynamicLayer.prototype.OpenFile = function () {
        var _this = this;
        fs.readFile(this.file, 'utf8', function (err, data) {
            if (!err) {
                _this.geojson = JSON.parse(data);
                _this.geojson.features.forEach(function (f) {
                    _this.initFeature(f);
                });
            }
            else {
                console.log('error:' + _this.file);
            }
        });
    };
    DynamicLayer.prototype.getDataSource = function (req, res) {
        console.log('get DataSource');
        res.send(this.geojson);
    };
    DynamicLayer.prototype.initFeature = function (f) {
        if (!f.id) {
            f.id = utils.newGuid();
        }
    };
    DynamicLayer.prototype.updateSensorValue = function (ss, date, value) {
        ss.timestamps.push(date);
        ss.values.push(value);
        this.connection.updateSensorValue(ss.id, date, value);
    };
    DynamicLayer.prototype.addFeature = function (f, updated) {
        if (updated === void 0) { updated = true; }
        if (updated) {
            f.properties['updated'] = new Date().getTime();
        }
        this.initFeature(f);
        if (this.manager) {
            this.manager.addFeature(this.layerId, f, {}, function (cb) { });
        }
    };
    DynamicLayer.prototype.start = function () {
        var _this = this;
        console.log('start case layer');
        this.server.get('/cases/' + this.layerId, function (req, res) { _this.getLayer(req, res); });
        this.startDate = new Date().getTime();
    };
    DynamicLayer.prototype.updateLog = function (featureId, msgBody, client, notify) {
        var f;
        console.log(JSON.stringify(msgBody));
        this.geojson.features.some(function (feature) {
            if (!feature.id || feature.id !== featureId) {
                return false;
            }
            f = feature;
            return true;
        });
        if (!f) {
            return;
        }
        if (!f.hasOwnProperty('logs')) {
            f.logs = {};
        }
        if (!f.hasOwnProperty('properties')) {
            f.properties = {};
        }
        var logs = msgBody.logs;
        for (var key in logs) {
            if (!f.logs.hasOwnProperty(key))
                f.logs[key] = [];
            logs[key].forEach(function (l) {
                f.logs[key].push(l);
                f.properties[key] = l.value;
            });
        }
        console.log('Log update' + featureId);
        if (notify) {
            this.emit('featureUpdated', this.layerId, featureId);
        }
    };
    DynamicLayer.prototype.updateFeature = function (ft, client, notify) {
        this.initFeature(ft);
        var feature = this.geojson.features.filter(function (k) { return k.id && k.id === ft.id; });
        if (feature && feature.length > 0) {
            var index = this.geojson.features.indexOf(feature[0]);
            this.geojson.features[index] = ft;
        }
        else {
            this.geojson.features.push(ft);
        }
        if (notify) {
            this.emit('featureUpdated', this.layerId, ft.id);
        }
    };
    return DynamicLayer;
})(events.EventEmitter);
exports.DynamicLayer = DynamicLayer;
//# sourceMappingURL=DynamicLayer.js.map