var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ApiManager = require('./ApiManager');
var Layer = ApiManager.Layer;
var ApiResult = ApiManager.ApiResult;
var mongodb = require('mongodb');
var BaseConnector = require('./BaseConnector');
var Winston = require('winston');
var MongoDBStorage = (function (_super) {
    __extends(MongoDBStorage, _super);
    function MongoDBStorage(server, port) {
        _super.call(this);
        this.server = server;
        this.port = port;
    }
    MongoDBStorage.prototype.initLayer = function (layer) {
    };
    MongoDBStorage.prototype.addLayer = function (layer, meta, callback) {
        var collection = this.db.collection(layer.id);
        collection.insert(layer.features, {}, function (e, result) {
            if (e)
                callback({ result: ApiResult.Error, error: e });
            else
                callback({ result: ApiResult.OK });
        });
        collection.ensureIndex({ 'coordinates.geometry': "2dsphere" }, function (e, indexname) {
            if (!e) {
                Winston.info("created a 2Dsphere geospatial index in layer " + layer.id + " upon insertion.");
            }
            else {
                Winston.info("Error during geospatial index creation. Error: " + e);
            }
        });
        collection.ensureIndex({ 'logs.prop': 1 }, { sparse: true }, function (e, indexname) {
            if (!e) {
                Winston.info("created a sparse index in layer " + layer.id + " upon insertion.");
            }
            else {
                Winston.info("Error during sparse index creation. Error: " + e);
            }
        });
    };
    MongoDBStorage.prototype.addLayerBulk = function (layer, callback) {
    };
    MongoDBStorage.prototype.getLayer = function (layerId, meta, callback) {
        var collection = this.db.collection(layerId);
        collection.find({}, { sort: [['_id', 1]] }).toArray(function (e, response) {
            if (e) {
                callback({ result: ApiResult.Error, error: e });
            }
            else {
                var results = new Layer();
                results.features = response;
                callback({ result: ApiResult.OK, layer: results });
            }
        });
    };
    MongoDBStorage.prototype.deleteLayer = function (layerId, meta, callback) {
        var collection = this.db.collection(layerId);
        collection.drop(function (err, removed) {
            if (!err) {
                callback({ result: ApiResult.OK });
            }
            else {
                callback({ result: ApiResult.Error, error: err });
            }
        });
    };
    MongoDBStorage.prototype.updateLayer = function (layer, meta, callback) {
        var collection = this.db.collection(layer.id);
        collection.update({}, { $set: layer }, { safe: true, multi: true }, function (e, response) {
            if (!e) {
                callback({ result: ApiResult.OK });
            }
            else {
                callback({ result: ApiResult.Error, error: e });
            }
        });
    };
    MongoDBStorage.prototype.addFeature = function (layerId, feature, meta, callback) {
        var collection = this.db.collection(layerId);
        feature.id = new mongodb.ObjectID(feature.id);
        collection.insert(feature, {}, function (e, response) {
            if (e) {
                callback({ result: ApiResult.Error, error: e });
            }
            else {
                callback({ result: ApiResult.OK });
            }
        });
    };
    MongoDBStorage.prototype.getFeature = function (layerId, featureId, meta, callback) {
        var collection = this.db.collection(layerId);
        collection.findOne({ _id: new mongodb.ObjectID(featureId) }, function (e, response) {
            if (e) {
                callback({ result: ApiResult.Error, error: e });
            }
            else {
                var f = response;
                callback({ result: ApiResult.OK, feature: f });
            }
        });
    };
    MongoDBStorage.prototype.updateFeature = function (layerId, feature, useLog, meta, callback) {
        var collection = this.db.collection(layerId);
        var featureId = new mongodb.ObjectID(feature._id);
        delete feature._id;
        collection.update({ _id: featureId }, { $set: feature }, { safe: true, multi: false }, function (e, response) {
            if (!e) {
                callback({ result: ApiResult.OK });
            }
            else {
                callback({ result: ApiResult.Error, error: e });
            }
        });
    };
    MongoDBStorage.prototype.deleteFeature = function (layerId, featureId, meta, callback) {
        var collection = this.db.collection(layerId);
        Winston.info("Deleting feature with ID " + new mongodb.ObjectID(featureId));
        collection.remove({ _id: new mongodb.ObjectID(featureId) }, function (e, response) {
            if (e) {
                callback({ result: ApiResult.Error, error: e });
            }
            else {
                callback({ result: ApiResult.OK });
            }
        });
    };
    MongoDBStorage.prototype.addLog = function (layerId, featureId, property, log, meta, callback) {
        var collection = this.db.collection(layerId);
        var update = { "$push": {} };
        update["$push"]["logs." + log.prop] = log;
        log.ts = Date.now();
        collection.update({ _id: featureId }, update, { multi: false }, function (e, response) {
            if (!e) {
                callback({ result: ApiResult.OK });
            }
            else {
                callback({ result: ApiResult.Error, error: e });
            }
        });
    };
    MongoDBStorage.prototype.addLog2 = function (layerId, featureId, log, meta, callback) {
        var collection = this.db.collection(layerId);
        log.ts = Date.now();
        collection.update({ _id: featureId }, {
            $push: {
                logs: {
                    "ts": log.ts,
                    "prop": log.prop,
                    "value": log.value
                }
            }
        }, { multi: false }, function (e, response) {
            if (!e) {
                callback({ result: ApiResult.OK });
            }
            else {
                callback({ result: ApiResult.Error, error: e });
            }
        });
    };
    MongoDBStorage.prototype.getLog = function (layerId, featureId, meta, callback) {
        var collection = this.db.collection(layerId);
        collection.findOne({ _id: featureId }, { logs: 1 }, function (e, response) {
            if (e) {
                callback({ result: ApiResult.Error, error: e });
            }
            else {
                var f = response;
                callback({ result: ApiResult.OK, feature: f });
            }
        });
    };
    MongoDBStorage.prototype.deleteLog = function (layerId, featureId, ts, prop, meta, callback) {
        var collection = this.db.collection(layerId);
        collection.update({ _id: featureId }, {
            $pull: {
                logs: {
                    "ts": ts,
                    "prop": prop,
                }
            }
        }, { multi: false }, function (e, response) {
            if (!e) {
                callback({ result: ApiResult.OK });
            }
            else {
                callback({ result: ApiResult.Error, error: e });
            }
        });
    };
    MongoDBStorage.prototype.updateProperty = function (layerId, featureId, property, value, useLog, meta, callback) {
    };
    MongoDBStorage.prototype.getBBox = function (layerId, southWest, northEast, meta, callback) {
        var collection = this.db.collection(layerId);
        collection.find({
            'geometry.coordinates': {
                $geoWithin: {
                    $box: [
                        southWest, northEast
                    ]
                }
            }
        }).toArray(function (e, response) {
            if (e) {
                callback({ result: ApiResult.Error, error: e });
            }
            else {
                var results = new Layer();
                results.features = response;
                callback({ result: ApiResult.OK, layer: results });
            }
        });
    };
    MongoDBStorage.prototype.getSphere = function (layerId, maxDistance, longtitude, latitude, meta, callback) {
        var collection = this.db.collection(layerId);
        collection.aggregate([
            {
                $geoNear: {
                    near: { type: "Point", coordinates: [longtitude, latitude] },
                    "maxDistance": maxDistance,
                    "distanceField": "distance",
                    "distanceMultiplier": 1,
                    "num": 1000,
                    "spherical": true
                }
            }
        ], function (e, response) {
            if (e) {
                callback({ result: ApiResult.Error, error: e });
            }
            else {
                var l = new Layer();
                l.type = "FeatureCollection";
                l = response;
                callback({ result: ApiResult.OK, layer: l });
            }
        });
    };
    MongoDBStorage.prototype.getWithinPolygon = function (layerId, feature, meta, callback) {
        var collection = this.db.collection(layerId);
        Winston.info(JSON.stringify(feature));
        collection.aggregate([
            {
                $match: {
                    'geometry.coordinates': {
                        $geoWithin: {
                            $geometry: {
                                type: "Polygon",
                                coordinates: feature.geometry.coordinates
                            }
                        }
                    }
                }
            }], function (e, response) {
            if (e) {
                callback({ result: ApiResult.Error, error: e });
            }
            else {
                var l = new Layer();
                l.type = "FeatureCollection";
                l = response;
                callback({ result: ApiResult.OK, layer: l });
            }
        });
    };
    MongoDBStorage.prototype.init = function (layerManager, options, callback) {
        this.manager = layerManager;
        var server = new mongodb.Server(this.server, this.port, { auto_reconnect: true });
        this.db = new mongodb.Db('commonSenseWeb', server, { w: 1 });
        this.db.open(function () {
            Winston.info('connection succes');
        });
        Winston.info('init MongoDB Storage');
        callback();
    };
    return MongoDBStorage;
})(BaseConnector.BaseConnector);
exports.MongoDBStorage = MongoDBStorage;
//# sourceMappingURL=MongoDB.js.map