var fs = require('fs');
var path = require('path');
var chokidar = require('chokidar');
var DynamicProject = (function () {
    function DynamicProject(folder, id, service, messageBus) {
        this.folder = folder;
        this.id = id;
        this.service = service;
        this.messageBus = messageBus;
    }
    DynamicProject.prototype.Start = function () {
        /*var feature = new csComp.Services.Feature();
        feature.id = "hoi";
        console.log(JSON.stringify(feature));*/
        var _this = this;
        this.openFile();
        this.watchFolder();
        this.service.server.get("/project/" + this.id, function (req, res) { _this.GetLayer(req, res); });
    };
    DynamicProject.prototype.AddLayer = function (data) {
        var groupFolder = this.folder + "\\" + data.group;
        var resourceFolder = this.folder + "\\..\\..\\resourceTypes";
        var geojsonfile = groupFolder + "\\" + data.reference + ".json";
        var resourcefile = resourceFolder + "\\" + data.featureType + ".json";
        if (!fs.existsSync(groupFolder))
            fs.mkdirSync(groupFolder);
        if (!fs.existsSync(resourceFolder))
            fs.mkdirSync(resourceFolder);
        var combinedjson = this.splitJson(data);
        fs.writeFileSync(resourcefile, JSON.stringify(combinedjson.resourcejson));
        fs.writeFileSync(geojsonfile, JSON.stringify(combinedjson.geojson));
        console.log('done!');
    };
    DynamicProject.prototype.splitJson = function (data) {
        var geojson = {}, resourcejson = {};
        var combinedjson = data.geojson;
        if (combinedjson.hasOwnProperty('type') && combinedjson.hasOwnProperty('features')) {
            geojson = {
                type: combinedjson.type,
                features: combinedjson.features
            };
        }
        if (combinedjson.hasOwnProperty('timestamps')) {
            geojson['timestamps'] = combinedjson['timestamps'];
        }
        if (combinedjson.hasOwnProperty('featureTypes')) {
            for (var ftName in combinedjson.featureTypes) {
                if (combinedjson.featureTypes.hasOwnProperty(ftName)) {
                    var defaultFeatureType = combinedjson.featureTypes[ftName];
                    if (defaultFeatureType.hasOwnProperty('propertyTypeData')) {
                        var propertyTypeObjects = {};
                        var propKeys = '';
                        defaultFeatureType.propertyTypeData.forEach(function (pt) {
                            propertyTypeObjects[pt.label] = pt;
                            propKeys = propKeys + pt.label + ';';
                        });
                        delete defaultFeatureType.propertyTypeData;
                        defaultFeatureType.propertyTypeKeys = propKeys;
                        defaultFeatureType.name = data.featureType;
                        resourcejson['featureTypes'] = {};
                        resourcejson.featureTypes[data.featureType] = defaultFeatureType;
                        resourcejson['propertyTypeData'] = {};
                        resourcejson.propertyTypeData = propertyTypeObjects;
                        data.defaultFeatureType = defaultFeatureType.name;
                    }
                }
            }
        }
        return { geojson: geojson, resourcejson: resourcejson };
    };
    DynamicProject.prototype.openFile = function () {
        var _this = this;
        var f = this.folder + "\\project.json";
        fs.readFile(f, 'utf8', function (err, data) {
            if (!err) {
                try {
                    _this.project = JSON.parse(data);
                    if (!_this.project.id)
                        _this.project.id = _this.project.title;
                    if (!_this.project.groups)
                        _this.project.groups = [];
                }
                catch (e) {
                    console.log("Error (" + f + "): " + e);
                }
            }
        });
    };
    DynamicProject.prototype.watchFolder = function () {
        var _this = this;
        console.log('watch folder:' + this.folder);
        setTimeout(function () {
            var watcher = chokidar.watch(_this.folder, { ignoreInitial: false, ignored: /[\/\\]\./, persistent: true });
            watcher.on('all', (function (action, path) {
                if (action == "add") {
                    _this.addLayer(path);
                }
                if (action == "unlink") {
                    _this.removeLayer(path);
                }
                if (action == "change") {
                    _this.addLayer(path);
                }
            }));
        }, 1000);
    };
    DynamicProject.prototype.removeLayer = function (file) {
        console.log("removing : " + file);
        var p = path;
        var pp = file.split(p.sep);
        if (p.basename(file) === 'project.json')
            return;
        var groupTitle = p.dirname(file).replace(this.folder, "").replace(p.sep, "");
        if (groupTitle === "")
            return;
        var gg = this.project.groups.filter(function (element) { return (element != null && element.title && element.title.toLowerCase() == groupTitle.toLowerCase()); });
        var g = {};
        if (gg.length > 0) {
            g = gg[0];
            var layer = {};
            layer.id = file;
            layer.groupId = g.title;
            g.layers = g.layers.filter(function (l) { return layer.id != l.id; });
            this.service.connection.publish(this.project.id, "project", "layer-remove", [layer]);
        }
    };
    DynamicProject.prototype.addLayer = function (file) {
        if (!this.project)
            return;
        var p = path;
        var pp = file.split(p.sep);
        if (p.basename(file) === 'project.json')
            return;
        var groupTitle = p.dirname(file).replace(this.folder, "").replace(p.sep, "");
        if (groupTitle === "")
            return;
        var parameters = this.service.projectParameters[groupTitle];
        if (!parameters)
            return;
        if (!this.project.groups)
            this.project.groups = [];
        var gg = this.project.groups.filter(function (element) { return (element != null && element.title && element.title.toLowerCase() == groupTitle.toLowerCase()); });
        var g = {};
        if (gg.length > 0) {
            g = gg[0];
        }
        else {
            g.id = groupTitle;
            g.title = groupTitle;
            g.layers = [];
            g.oneLayerActive = false;
            this.project.groups.push(g);
        }
        if (parameters.useClustering) {
            g.clustering = true;
            g.clusterLevel = parameters.clusterLevel;
        }
        var tt = file.split('\\');
        var t = tt[tt.length - 1].replace('.json', '');
        var layer = {};
        layer.id = file;
        layer.description = parameters.description;
        layer.title = parameters.layerTitle;
        layer.type = "geojson";
        layer.dynamicResource = true;
        layer.url = "data/projects/" + this.id + "/" + g.title + "/" + p.basename(file);
        layer.groupId = g.id;
        layer.enabled = parameters.enabled;
        layer.reference = parameters.reference;
        layer.defaultFeatureType = parameters.featureType;
        if (parameters.featureType)
            layer.typeUrl = "data/resourceTypes/" + parameters.featureType + ".json";
        var layerExists = false;
        for (var i = 0; i < g.layers.length; i++) {
            if (g.layers[i].id === layer.id) {
                layerExists = true;
                break;
            }
        }
        if (!layerExists)
            g.layers.push(layer);
        this.service.connection.publish(this.project.id, "project", "layer-update", { layer: [layer], group: g });
    };
    DynamicProject.prototype.GetLayer = function (req, res) {
        console.log("Get Layer: " + this.folder);
        res.send(JSON.stringify(this.project));
    };
    return DynamicProject;
})();
exports.DynamicProject = DynamicProject;
var DynamicProjectService = (function () {
    function DynamicProjectService(server, connection, messageBus) {
        this.server = server;
        this.connection = connection;
        this.messageBus = messageBus;
        this.projects = {};
        this.projectParameters = {};
    }
    DynamicProjectService.prototype.Start = function (server) {
        var _this = this;
        console.log("Start project service");
        this.messageBus.subscribe('dynamic_project_layer', function (title, data) {
            if (title === 'send-layer') {
                _this.connection.publish(data.id, "layer", "layer-update", data);
            }
            else {
                if (_this.projects.hasOwnProperty(data.project)) {
                    var dp = _this.projects[data.project];
                    dp.AddLayer(data);
                    _this.projectParameters[data.group] = data;
                }
            }
        });
        var rootDir = "public\\data\\projects";
        fs.readdir(rootDir, function (error, folders) {
            if (!error) {
                folders.forEach(function (f) {
                    var filePath = rootDir + "\\" + f;
                    fs.stat(filePath, function (error, stat) {
                        if (!error && stat.isDirectory && filePath.indexOf('projects.json') == -1) {
                            var dp = new DynamicProject(filePath, f, _this, _this.messageBus);
                            _this.projects[f] = dp;
                            dp.Start();
                        }
                    });
                });
            }
        });
    };
    return DynamicProjectService;
})();
exports.DynamicProjectService = DynamicProjectService;
//# sourceMappingURL=DynamicProject.js.map