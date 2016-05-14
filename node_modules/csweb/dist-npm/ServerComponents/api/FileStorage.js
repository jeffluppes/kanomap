var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ApiManager = require('./ApiManager');
var fs = require('fs-extra');
var path = require('path');
var ApiResult = ApiManager.ApiResult;
var BaseConnector = require('./BaseConnector');
var _ = require('underscore');
var chokidar = require('chokidar');
var StringExt = require('../helpers/StringExt');
var Winston = require('winston');
var helpers = require('../helpers/Utils');
var sift = require('sift');
var FileStorage = (function (_super) {
    __extends(FileStorage, _super);
    function FileStorage(rootpath, watch) {
        var _this = this;
        if (watch === void 0) { watch = true; }
        _super.call(this);
        this.rootpath = rootpath;
        this.layers = {};
        this.projects = {};
        this.keys = {};
        this.resources = {};
        this.saveProjectDelay = _.debounce(function (project) {
            _this.saveProjectFile(project);
        }, 5000);
        this.saveResourcesDelay = _.debounce(function (res) {
            _this.saveResourceFile(res);
        }, 25);
        this.saveKeyDelay = _.debounce(function (key) {
            _this.saveKeyFile(key);
        }, 5000);
        this.saveLayerDelay = _.debounce(function (layer) {
            _this.saveLayerFile(layer);
        }, 2000);
        this.receiveCopy = false;
        this.keysPath = path.join(rootpath, "keys/");
        this.layersPath = path.join(rootpath, "layers/");
        this.projectsPath = path.join(rootpath, "projects/");
        this.resourcesPath = path.join(rootpath, "resourceTypes/");
        this.blobPath = path.join(rootpath, "blobs/");
        this.iconPath = path.join(rootpath, "../images/");
        if (!fs.existsSync(rootpath)) {
            fs.mkdirsSync(rootpath);
        }
        if (watch) {
            this.watchLayersFolder();
            this.watchKeysFolder();
            this.watchProjectsFolder();
            this.watchResourcesFolder();
        }
    }
    FileStorage.prototype.watchLayersFolder = function () {
        var _this = this;
        Winston.info('filestore: watch folder:' + this.layersPath);
        if (!fs.existsSync(this.layersPath)) {
            fs.mkdirSync(this.layersPath);
        }
        setTimeout(function () {
            var watcher = chokidar.watch(_this.layersPath, { ignoreInitial: false, ignored: /[\/\\]\./, persistent: true });
            watcher.on('all', (function (action, path) {
                if (action == "add") {
                    Winston.info('filestore: new file found : ' + path);
                    _this.openLayerFile(path);
                }
                if (action == "unlink") {
                    _this.closeLayerFile(path);
                }
                if (action == "change") {
                }
            }));
        }, 1000);
    };
    FileStorage.prototype.watchProjectsFolder = function () {
        var _this = this;
        Winston.info('filestore: watch folder:' + this.projectsPath);
        if (!fs.existsSync(this.projectsPath)) {
            fs.mkdirSync(this.projectsPath);
        }
        setTimeout(function () {
            var watcher = chokidar.watch(_this.projectsPath, { ignoreInitial: false, ignored: /[\/\\]\./, persistent: true });
            watcher.on('all', (function (action, path) {
                if (action == "add") {
                    Winston.info('filestore: new file found : ' + path);
                    _this.openProjectFile(path);
                }
                if (action == "unlink") {
                    _this.closeLayerFile(path);
                }
                if (action == "change") {
                }
            }));
        }, 1000);
    };
    FileStorage.prototype.watchKeysFolder = function () {
        var _this = this;
        Winston.info('filestore: watch folder:' + this.keysPath);
        if (!fs.existsSync(this.keysPath)) {
            fs.mkdirSync(this.keysPath);
        }
        setTimeout(function () {
            var watcher = chokidar.watch(_this.keysPath, { ignoreInitial: false, ignored: /[\/\\]\./, persistent: true });
            watcher.on('all', (function (action, path) {
                if (action == "add") {
                    Winston.info('filestore: new file found : ' + path);
                    _this.openKeyFile(path);
                }
                if (action == "unlink") {
                    _this.closeKeyFile(path);
                }
                if (action == "change") {
                }
            }));
        }, 1000);
    };
    FileStorage.prototype.watchResourcesFolder = function () {
        var _this = this;
        Winston.info('filestore: watch folder:' + this.resourcesPath);
        if (!fs.existsSync(this.resourcesPath)) {
            fs.mkdirSync(this.resourcesPath);
        }
        setTimeout(function () {
            var watcher = chokidar.watch(_this.resourcesPath, { ignoreInitial: false, ignored: /[\/\\]\./, persistent: true });
            watcher.on('all', (function (action, path) {
                if (action == "add") {
                    Winston.info('filestore: new file found : ' + path);
                    _this.openResourceFile(path);
                }
                if (action == "unlink") {
                    _this.closeResourceFile(path);
                }
                if (action == "change") {
                }
            }));
        }, 1000);
    };
    FileStorage.prototype.getProjectFilename = function (projectId) {
        return path.join(this.projectsPath, projectId + ".json");
    };
    FileStorage.prototype.getLayerFilename = function (layerId) {
        return path.join(this.layersPath, layerId + ".json");
    };
    FileStorage.prototype.getKeyFilename = function (keyId) {
        return path.join(this.keysPath, keyId + ".json");
    };
    FileStorage.prototype.getResourceFilename = function (resId) {
        return path.join(this.resourcesPath, resId + ".json");
    };
    FileStorage.prototype.saveKeyFile = function (key) {
        var fn = this.getKeyFilename(key.id);
        fs.outputFile(fn, JSON.stringify(key), function (error) {
            if (error) {
                Winston.error('filestore: error writing file : ' + fn + error.message);
            }
            else {
                Winston.info('filestore: file saved : ' + fn);
            }
        });
    };
    FileStorage.prototype.saveResourceFile = function (res) {
        var fn = this.getResourceFilename(res.id);
        fs.outputFile(fn, JSON.stringify(res), function (error) {
            if (error) {
                Winston.error('filestore: error writing file : ' + fn);
            }
            else {
                Winston.info('filestore: file saved : ' + fn);
            }
        });
    };
    FileStorage.prototype.saveProjectFile = function (project) {
        var fn = this.getProjectFilename(project.id);
        fs.writeFile(fn, JSON.stringify(project), function (error) {
            if (error) {
                Winston.info('error writing file : ' + fn);
            }
            else {
                Winston.info('filestore: file saved : ' + fn);
            }
        });
    };
    FileStorage.prototype.saveBase64 = function (media) {
        var binaryData = new Buffer(media.base64, 'base64');
        fs.writeFile(media.fileUri, binaryData, function (error) {
            if (error) {
                Winston.error('filestore: error writing file : ' + media.fileUri);
            }
            else {
                Winston.info('filestore: file saved : ' + media.fileUri);
            }
        });
    };
    FileStorage.prototype.saveLayerFile = function (layer) {
        var fn = this.getLayerFilename(layer.id);
        fs.writeFile(fn, JSON.stringify(layer), function (error) {
            if (error) {
                Winston.info('error writing file : ' + fn);
            }
            else {
                Winston.info('filestore: file saved : ' + fn);
            }
        });
    };
    FileStorage.prototype.getProjectId = function (fileName) {
        return path.basename(fileName).toLowerCase().replace('.json', '');
    };
    FileStorage.prototype.getKeyId = function (fileName) {
        return path.basename(fileName).toLowerCase().replace('.json', '');
    };
    FileStorage.prototype.getResourceId = function (fileName) {
        return path.basename(fileName).toLowerCase().replace('.json', '');
    };
    FileStorage.prototype.getLayerId = function (fileName) {
        return path.basename(fileName).toLowerCase().replace('.json', '');
    };
    FileStorage.prototype.closeLayerFile = function (fileName) {
        var id = this.getLayerId(fileName);
        this.manager.deleteLayer(id, {}, function () { });
    };
    FileStorage.prototype.closeKeyFile = function (fileName) {
    };
    FileStorage.prototype.closeResourceFile = function (fileName) {
    };
    FileStorage.prototype.closeProjectFile = function (fileName) {
        var id = this.getProjectId(fileName);
        this.manager.deleteProject(id, {}, function () { });
    };
    FileStorage.prototype.openLayerFile = function (fileName) {
        var _this = this;
        var id = this.getLayerId(fileName);
        Winston.info('filestore: openfile ' + id);
        if (!this.layers.hasOwnProperty(id)) {
            fs.readFile(fileName, "utf8", function (err, data) {
                if (!err) {
                    var layer;
                    try {
                        layer = JSON.parse(data);
                    }
                    catch (e) {
                        Winston.warn("Error parsing file: " + fileName + ". Skipped");
                        return;
                    }
                    layer.storage = _this.id;
                    layer.id = id;
                    _this.layers[id] = layer;
                    layer.storage = _this.id;
                    layer.url = "/api/layers/" + id;
                    Winston.info('storage ' + layer.storage);
                    _this.manager.addUpdateLayer(layer, {}, function () { });
                }
            });
        }
        if (path.basename(fileName) === 'project.json')
            return;
    };
    FileStorage.prototype.openKeyFile = function (fileName) {
        var _this = this;
        var id = this.getKeyId(fileName);
        Winston.info('filestore: openfile ' + id);
        if (!this.keys.hasOwnProperty(id)) {
            fs.readFile(fileName, "utf8", function (err, data) {
                if (!err) {
                    var key = JSON.parse(data);
                    key.storage = _this.id;
                    key.id = id;
                    _this.keys[id] = key;
                    _this.manager.addKey(key, { source: _this.id }, function () { });
                }
            });
        }
    };
    FileStorage.prototype.openResourceFile = function (fileName) {
        var _this = this;
        var id = this.getResourceId(fileName);
        Winston.info('filestore: openfile ' + id);
        if (!this.resources.hasOwnProperty(id)) {
            fs.readFile(fileName, 'utf8', function (err, data) {
                if (!err && data && data.length > 0) {
                    var res = JSON.parse(data.removeBOM());
                    res.id = id;
                    _this.resources[id] = res;
                    _this.manager.addResource(res, { source: _this.id }, function () { });
                }
            });
        }
    };
    FileStorage.prototype.openProjectFile = function (fileName) {
        var _this = this;
        var id = this.getProjectId(fileName);
        Winston.info('filestore: openfile ' + id);
        if (!this.projects.hasOwnProperty(id)) {
            fs.readFile(fileName, 'utf8', function (err, data) {
                if (!err && data && data.length > 0) {
                    var project = JSON.parse(data);
                    _this.manager.getProjectDefinition(project);
                    _this.projects[id] = project;
                    _this.manager.updateProject(project, {}, function () { });
                }
                else {
                    Winston.error('Error reading file: ' + id + '(' + err.message + ')');
                }
            });
        }
        if (path.basename(fileName) === 'project.json') {
            return;
        }
    };
    FileStorage.prototype.findLayer = function (layerId) {
        if (this.layers.hasOwnProperty(layerId)) {
            return this.layers[layerId];
        }
        else {
            return null;
        }
        ;
    };
    FileStorage.prototype.addProject = function (project, meta, callback) {
        try {
            this.projects[project.id] = project;
            this.saveProjectDelay(project);
            callback({ result: ApiResult.OK, project: project });
        }
        catch (e) {
            callback({ result: ApiResult.OK, error: null });
        }
    };
    FileStorage.prototype.getProject = function (projectId, meta, callback) {
        if (this.projects.hasOwnProperty(projectId)) {
            callback({ result: ApiResult.OK, project: this.projects[projectId] });
        }
        else {
            callback({ result: ApiResult.ProjectNotFound });
        }
    };
    FileStorage.prototype.updateProject = function (project, meta, callback) {
        if (this.projects.hasOwnProperty(project.id)) {
            this.projects[project.id] = project;
            this.saveProjectDelay(project);
            Winston.info('Added project ' + project.id + ' to FileStorage projects');
            callback({ result: ApiResult.OK, project: null });
        }
        else {
            callback({ result: ApiResult.Error });
        }
    };
    FileStorage.prototype.addLayer = function (layer, meta, callback) {
        try {
            this.layers[layer.id] = layer;
            this.saveLayerDelay(layer);
            callback({ result: ApiResult.OK });
        }
        catch (e) {
            callback({ result: ApiResult.OK, error: null });
        }
    };
    FileStorage.prototype.getLayer = function (layerId, meta, callback) {
        if (this.layers.hasOwnProperty(layerId)) {
            callback({ result: ApiResult.OK, layer: this.layers[layerId] });
        }
        else {
            callback({ result: ApiResult.LayerNotFound });
        }
    };
    FileStorage.prototype.updateLayer = function (layer, meta, callback) {
        if (this.layers.hasOwnProperty(layer.id)) {
            this.layers[layer.id] = layer;
            this.saveLayerDelay(layer);
            Winston.info("FileStorage: updated layer " + layer.id);
            callback({ result: ApiResult.OK, layer: null });
        }
        else {
            callback({ result: ApiResult.Error });
        }
    };
    FileStorage.prototype.deleteLayer = function (layerId, meta, callback) {
        if (this.layers.hasOwnProperty(layerId)) {
            delete this.layers[layerId];
            var fn = this.getLayerFilename(layerId);
            fs.unlink(fn, function (err) {
                if (err) {
                    Winston.error('File: Error deleting ' + fn + " (" + err.message + ")");
                }
                else {
                    Winston.info('File: deleted: ' + fn);
                }
            });
            callback({ result: ApiResult.OK, layer: null });
        }
        else {
            callback({ result: ApiResult.Error });
        }
    };
    FileStorage.prototype.searchLayer = function (layerId, keyWord, meta, callback) {
        Winston.error('search request:' + layerId + " (" + keyWord + ")");
        var result = [];
        callback({ result: ApiResult.OK, features: result });
    };
    FileStorage.prototype.addFeature = function (layerId, feature, meta, callback) {
        var layer = this.findLayer(layerId);
        if (layer) {
            if (!layer.features.some(function (f) { return f.id === feature.id; })) {
                layer.features.push(feature);
                this.saveLayerDelay(layer);
                callback({ result: ApiResult.OK, layer: null });
            }
            else {
                Winston.error('filestorage: add feature: feature id already exists');
                callback({ result: ApiResult.Error, error: "Feature ID already exists" });
            }
        }
        else {
            callback({ result: ApiResult.Error });
        }
    };
    FileStorage.prototype.updateProperty = function (layerId, featureId, property, value, useLog, meta, callback) {
    };
    FileStorage.prototype.updateLogs = function (layerId, featureId, logs, meta, callback) {
        var f;
        var layer = this.findLayer(layerId);
        layer.features.some(function (feature) {
            if (!feature.id || feature.id !== featureId)
                return false;
            f = feature;
            return true;
        });
        if (!f) {
            callback({ result: ApiResult.Error });
            return;
        }
        if (!f.hasOwnProperty('logs'))
            f.logs = {};
        if (!f.hasOwnProperty('properties'))
            f.properties = {};
        for (var key in logs) {
            if (!f.logs.hasOwnProperty(key))
                f.logs[key] = [];
            logs[key].forEach(function (l) {
                delete l.prop;
                f.logs[key].push(l);
                if (key != "~geometry")
                    f.properties[key] = l.value;
            });
        }
        this.saveLayerDelay(layer);
        callback({ result: ApiResult.OK, layer: null });
    };
    FileStorage.prototype.getFeature = function (layerId, featureId, meta, callback) {
        var l = this.layers[layerId];
        var found = false;
        l.features.forEach(function (f) {
            if (f.id === featureId)
                found = true;
            callback({ result: ApiResult.OK, feature: f });
        });
        if (!found)
            callback({ result: ApiResult.Error });
    };
    FileStorage.prototype.updateFeature = function (layerId, feature, useLog, meta, callback) {
        var layer = this.findLayer(layerId);
        if (!layer) {
            callback({ result: ApiResult.LayerNotFound, layer: null });
            return;
        }
        if (!layer.features) {
            callback({ result: ApiResult.FeatureNotFound, layer: null });
            return;
        }
        var f = layer.features.filter(function (k) { return k.id && k.id === feature.id; });
        if (f && f.length > 0) {
            var index = layer.features.indexOf(f[0]);
            layer.features[index] = feature;
        }
        else {
            layer.features.push(feature);
        }
        this.saveLayerDelay(layer);
        Winston.info("filestore: update feature");
        callback({ result: ApiResult.OK, layer: null });
    };
    FileStorage.prototype.deleteFeature = function (layerId, featureId, meta, callback) {
        var layer = this.findLayer(layerId);
        if (layer && layer.features) {
            layer.features = layer.features.filter(function (k) { return k.id && k.id !== featureId; });
            this.saveLayerDelay(layer);
        }
        callback({ result: ApiResult.OK });
    };
    FileStorage.prototype.addFile = function (base64, folder, file, meta, callback) {
        var ext = path.extname(file).toLowerCase();
        var fileUri = file.split('/').pop();
        switch (ext) {
            case '.png':
            case '.jpg':
            case '.gif':
            case '.jpeg':
            case '.tif':
            case '.tiff':
                fileUri = path.join(this.iconPath, fileUri);
                break;
            default:
                fileUri = path.join(this.blobPath, fileUri);
                break;
        }
        var media = { base64: base64, fileUri: fileUri };
        this.saveBase64(media);
        callback({ result: ApiResult.OK });
    };
    FileStorage.prototype.addResource = function (res, meta, callback) {
        if (!res.id)
            res.id = helpers.newGuid();
        if (!res.propertyTypes)
            res.propertyTypes = {};
        if (!res.featureTypes)
            res.featureTypes = {};
        this.resources[res.id] = res;
        this.saveResourcesDelay(res);
        callback({ result: ApiResult.OK });
    };
    FileStorage.prototype.addKey = function (key, meta, callback) {
        if (!key.id)
            key.id = helpers.newGuid();
        if (!key.values)
            key.values = [];
        this.keys[key.id] = key;
        this.saveKeyDelay(key);
        callback({ result: ApiResult.OK });
    };
    FileStorage.prototype.getKey = function (keyId, meta, callback) {
        if (this.keys.hasOwnProperty(keyId)) {
            var k = this.keys[keyId];
            callback({ result: ApiResult.OK, key: k });
        }
        else {
            callback({ result: ApiResult.KeyNotFound });
        }
    };
    FileStorage.prototype.updateKey = function (keyId, value, meta, callback) {
        if (!this.keys.hasOwnProperty(keyId))
            this.addKey({ id: keyId, storage: '' }, meta, function () { });
        var k = this.keys[keyId];
        if (k != null) {
            k.values.push(value);
        }
        if (k.storage === 'file')
            this.saveKeyDelay(k);
    };
    FileStorage.prototype.init = function (layerManager, options) {
        this.manager = layerManager;
        Winston.info('filestore: init File Storage');
    };
    return FileStorage;
})(BaseConnector.BaseConnector);
exports.FileStorage = FileStorage;
//# sourceMappingURL=FileStorage.js.map