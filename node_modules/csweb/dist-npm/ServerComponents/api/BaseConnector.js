var ApiManager = require('./ApiManager');
var ApiResult = ApiManager.ApiResult;
var BaseConnector = (function () {
    function BaseConnector() {
        this.receiveCopy = true;
    }
    BaseConnector.prototype.initLayer = function (layer) {
    };
    BaseConnector.prototype.addLayer = function (layer, meta, callback) {
    };
    BaseConnector.prototype.getLayer = function (layerId, meta, callback) {
    };
    BaseConnector.prototype.updateLayer = function (layer, meta, callback) {
    };
    BaseConnector.prototype.deleteLayer = function (layerId, meta, callback) {
    };
    BaseConnector.prototype.searchLayer = function (layerId, keyWord, meta, callback) {
        callback({ result: ApiResult.SearchNotImplemented });
    };
    BaseConnector.prototype.addLayerToProject = function (layerId, meta, callback) {
    };
    BaseConnector.prototype.removeLayerFromProject = function (layerId, meta, callback) {
    };
    BaseConnector.prototype.allGroups = function (projectId, meta, callback) {
    };
    BaseConnector.prototype.addGroup = function (group, projectId, meta, callback) {
    };
    BaseConnector.prototype.removeGroup = function (groupId, projectId, meta, callback) {
    };
    BaseConnector.prototype.addFeature = function (layerId, feature, meta, callback) {
    };
    BaseConnector.prototype.getFeature = function (layerId, i, meta, callback) {
    };
    BaseConnector.prototype.updateFeature = function (layerId, feature, useLog, meta, callback) {
    };
    BaseConnector.prototype.deleteFeature = function (layerId, featureId, meta, callback) {
    };
    BaseConnector.prototype.updateProperty = function (layerId, featureId, property, value, useLog, meta, callback) {
    };
    BaseConnector.prototype.updateLogs = function (layerId, featureId, logs, meta, callback) {
    };
    BaseConnector.prototype.addLog = function (layerId, featureId, property, log, meta, callback) {
    };
    BaseConnector.prototype.getLog = function (layerId, featureId, meta, callback) {
    };
    BaseConnector.prototype.deleteLog = function (layerId, featureId, ts, prop, meta, callback) {
    };
    BaseConnector.prototype.getBBox = function (layerId, southWest, northEast, meta, callback) {
    };
    BaseConnector.prototype.getSphere = function (layerId, maxDistance, longtitude, latitude, meta, callback) {
    };
    BaseConnector.prototype.getWithinPolygon = function (layerId, feature, meta, callback) {
    };
    BaseConnector.prototype.initProject = function (project) {
    };
    BaseConnector.prototype.addProject = function (project, meta, callback) {
    };
    BaseConnector.prototype.getProject = function (projectId, meta, callback) {
    };
    BaseConnector.prototype.updateProject = function (project, meta, callback) {
    };
    BaseConnector.prototype.deleteProject = function (projectId, meta, callback) {
    };
    BaseConnector.prototype.addFile = function (base64, folder, file, meta, callback) {
    };
    BaseConnector.prototype.addResource = function (resource, meta, callback) {
    };
    BaseConnector.prototype.getKey = function (keyId, meta, callback) { };
    BaseConnector.prototype.getKeys = function (meta, callback) { };
    BaseConnector.prototype.updateKey = function (keyId, value, meta, callback) { };
    BaseConnector.prototype.deleteKey = function (keyId, meta, callback) { };
    BaseConnector.prototype.init = function (layerManager, options, callback) {
    };
    BaseConnector.prototype.subscribeKey = function (keyPattern, meta, callback) { };
    return BaseConnector;
})();
exports.BaseConnector = BaseConnector;
//# sourceMappingURL=BaseConnector.js.map