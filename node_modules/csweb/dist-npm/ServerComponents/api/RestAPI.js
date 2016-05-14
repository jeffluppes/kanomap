var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ApiManager = require('./ApiManager');
var cors = require('cors');
var Project = ApiManager.Project;
var Group = ApiManager.Group;
var Layer = ApiManager.Layer;
var Feature = ApiManager.Feature;
var ResourceFile = ApiManager.ResourceFile;
var BaseConnector = require('./BaseConnector');
var ApiResult = ApiManager.ApiResult;
var Winston = require('winston');
var request = require('request');
var RestAPI = (function (_super) {
    __extends(RestAPI, _super);
    function RestAPI(server, baseUrl) {
        if (baseUrl === void 0) { baseUrl = "/api"; }
        _super.call(this);
        this.server = server;
        this.baseUrl = baseUrl;
        this.isInterface = true;
        this.resourceUrl = baseUrl + "/resources/";
        this.layersUrl = baseUrl + "/layers/";
        this.searchUrl = baseUrl + "/search/";
        this.filesUrl = baseUrl + "/files/";
        this.keysUrl = baseUrl + "/keys/";
        this.projectsUrl = baseUrl + "/projects/";
        this.proxyUrl = baseUrl + "/proxy";
    }
    RestAPI.prototype.init = function (layerManager, options, callback) {
        var _this = this;
        this.manager = layerManager;
        console.log('Init Rest API on port ' + this.server.get('port') + '. Base path is ' + this.baseUrl);
        this.server.use(cors());
        this.server.get(this.resourceUrl, function (req, res) {
            res.send(JSON.stringify(_this.manager.resources));
        });
        this.server.post(this.resourceUrl, function (req, res) {
            var resource = new ResourceFile();
            resource = req.body;
            _this.manager.addResource(resource, { source: 'rest' }, function (result) {
                res.sendStatus(result.result);
            });
        });
        this.server.get(this.resourceUrl + ":resourceId", function (req, res) {
            res.send(JSON.stringify(_this.manager.getResource(req.params.resourceId.toLowerCase())));
        });
        this.server.get(this.layersUrl, function (req, res) {
            res.send(JSON.stringify(_this.manager.layers));
        });
        this.server.get(this.projectsUrl, function (req, res) {
            res.send(JSON.stringify(_this.manager.projects));
        });
        this.server.post(this.projectsUrl, function (req, res) {
            var project = new Project();
            project = req.body;
            _this.manager.addProject(project, { source: 'rest' }, function (result) {
                if (result.result === ApiResult.OK)
                    res.send(result.project);
            });
        });
        this.server.get(this.projectsUrl + ':projectId', function (req, res) {
            _this.manager.getProject(req.params.projectId, { source: 'rest' }, function (result) {
                if (result.result === ApiResult.OK) {
                    res.send(result.project);
                }
                else {
                    res.sendStatus(result.result);
                }
            });
        });
        this.server.put(this.projectsUrl + ':projectId', function (req, res) {
            req.projectId = req.params.projectId;
            _this.manager.updateProject(req.body, { source: 'rest' }, function (result) {
                res.sendStatus(result.result);
            });
        });
        this.server.delete(this.projectsUrl + ':projectId', function (req, res) {
            _this.manager.deleteProject(req.params.projectId, { source: 'rest' }, function (result) {
                res.sendStatus(result.result);
            });
        });
        this.server.post(this.projectsUrl + ":projectId/group/:groupId/layer/:layerId", function (req, res) {
            _this.manager.addLayerToProject(req.params.projectId, req.params.groupId, req.params.layerId, { source: 'rest' }, function (result) {
                res.sendStatus(result.result);
            });
        });
        this.server.delete(this.projectsUrl + ":projectId/group/:groupId/layer/:layerId", function (req, res) {
            _this.manager.removeLayerFromProject(req.params.projectId, req.params.groupId, req.params.layerId, { source: 'rest' }, function (result) {
                res.sendStatus(result.result);
            });
        });
        this.server.get(this.projectsUrl + ':projectId/group/', function (req, res) {
            _this.manager.allGroups(req.params.projectId, { source: 'rest' }, function (result) {
                if (result.result === ApiResult.OK) {
                    res.send(result.groups);
                }
                else {
                    res.sendStatus(result.result);
                }
            });
        });
        this.server.post(this.projectsUrl + ':projectId/group/', function (req, res) {
            var group = new Group();
            group = req.body;
            _this.manager.addGroup(group, req.params.projectId, { source: 'rest' }, function (result) {
                res.sendStatus(result.result);
            });
        });
        this.server.delete(this.projectsUrl + ':projectId/group/:groupId', function (req, res) {
            _this.manager.removeGroup(req.params.groupId, req.params.projectId, { source: 'rest' }, function (result) {
                res.sendStatus(result.result);
            });
        });
        this.server.post(this.layersUrl, function (req, res) {
            var layer = new Layer();
            layer = req.body;
            _this.manager.addUpdateLayer(layer, { source: 'rest' }, function (result) {
                res.sendStatus(result.result);
            });
        });
        this.server.get(this.layersUrl + ':layerId', function (req, res) {
            _this.manager.getLayer(req.params.layerId, { source: 'rest' }, function (result) {
                if (result.result === ApiResult.OK) {
                    res.send(result.layer);
                }
                else {
                    res.sendStatus(result.result);
                }
            });
        });
        this.server.put(this.layersUrl + ':layerId', function (req, res) {
            req.layerId = req.params.layerId;
            _this.manager.addUpdateLayer(req.body, { source: 'rest' }, function (result) {
                res.sendStatus(result.result);
            });
        });
        this.server.delete(this.layersUrl + ':layerId', function (req, res) {
            _this.manager.deleteLayer(req.params.layerId, { source: 'rest' }, function (result) {
                res.sendStatus(result.result);
            });
        });
        this.server.post(this.layersUrl + ":layerId/feature", function (req, res) {
            _this.manager.addFeature(req.params.layerId, req.body, { source: 'rest' }, function (result) {
                res.send(result);
            });
        });
        this.server.get(this.layersUrl + ":layerId/feature/:featureId", function (req, res) {
            _this.manager.getFeature(req.params.layerId, req.params.featureId, { source: 'rest' }, function (result) {
                res.sendStatus(result.result);
            });
        });
        this.server.put(this.layersUrl + ":layerId/feature/:featureId", function (req, res) {
            var feature = new Feature();
            feature = req.body;
            _this.manager.updateFeature(req.params.layerId, feature, { source: 'rest' }, function (result) {
                res.send(result);
            });
        });
        this.server.delete(this.layersUrl + ":layerId/feature/:featureId", function (req, res) {
            _this.manager.deleteFeature(req.params.layerId, req.params.featureId, { source: 'rest' }, function (result) {
                res.send(result);
            });
        });
        this.server.get(this.searchUrl + ":keyword", function (req, res) {
            _this.manager.searchLayers(req.params.keyword, [], { source: 'rest' }, function (result) {
                res.send(result);
            });
        });
        this.server.put(this.layersUrl + ":layerId/:featureId/log", function (req, res) {
            _this.manager.addLog(req.params.layerId, req.params.featureId, req.body.prop, req.body, { source: 'rest' }, function (result) {
                console.log("received log");
                res.send(result);
            });
        });
        this.server.get(this.layersUrl + ":layerId/:featureId/log", function (req, res) {
            _this.manager.getLog(req.params.layerId, req.params.featureId, { source: 'rest' }, function (result) {
                res.send(result);
            });
        });
        this.server.delete(this.layersUrl + ":layerId/:featureId/log", function (req, res) {
            _this.manager.deleteLog(req.params.layerId, req.params.featureId, req.body.ts, req.body.prop, { source: 'rest' }, function (result) {
                res.send(result);
            });
        });
        this.server.put(this.layersUrl + ":layerId/:featureId/logs", function (req, res) {
            var logs;
            logs = req.body;
            _this.manager.updateLogs(req.params.layerId, req.params.featureId, logs, { source: 'rest' }, function (result) {
                res.send(result);
            });
        });
        this.server.get(this.layersUrl + ":layerId/bbox", function (req, res) {
            var southWest = [Number(req.query.swlng), Number(req.query.swlat)];
            var northEast = [Number(req.query.nelng), Number(req.query.nelat)];
            _this.manager.getBBox(req.params.layerId, southWest, northEast, { source: 'rest' }, function (result) {
                res.send(result);
            });
        });
        this.server.get(this.layersUrl + ":layerId/getsphere", function (req, res) {
            _this.manager.getSphere(req.params.layerId, Number(req.query.maxDistance), Number(req.query.lng), Number(req.query.lat), { source: 'rest' }, function (result) {
                res.send(result);
            });
        });
        this.server.post(this.layersUrl + ":layerId/getwithinpolygon", function (req, res) {
            var feature = req.body;
            _this.manager.getWithinPolygon(req.params.layerId, feature, { source: 'rest' }, function (result) {
                res.send(result);
            });
        });
        this.server.post(this.keysUrl + ":keyId", function (req, res) {
            _this.manager.updateKey(req.params.keyId, req.body, { source: 'rest' }, function (result) {
                res.send(result);
            });
        });
        this.server.get(this.keysUrl, function (req, res) {
            _this.manager.getKeys({ source: 'rest' }, function (result) {
                res.send(result.keys);
            });
        });
        this.server.get(this.keysUrl + ":keyId", function (req, res) {
            _this.manager.getKey(req.params.keyId, { source: 'rest' }, function (result) {
                res.send(result.key);
            });
        });
        this.server.post(this.filesUrl + ":folderId/:fileName", function (req, res) {
            if (!req.body.hasOwnProperty('base64')) {
                Winston.error('Error receiving base64 encoded image: post the data as JSON, with the base64 property set to the base64 encoded string!');
                return;
            }
            _this.manager.addFile(req.body["base64"], req.params.folderId, req.params.fileName, { source: 'rest' }, function (result) {
                res.send(result);
            });
        });
        this.server.get(this.proxyUrl, function (req, res) {
            var id = req.query.url;
            console.log(id);
            _this.getUrl(id, res);
        });
        callback();
    };
    RestAPI.prototype.getUrl = function (feedUrl, res) {
        Winston.info('proxy request: ' + feedUrl);
        var parseNumbers = function (str) {
            if (!isNaN(str)) {
                str = str % 1 === 0 ? parseInt(str, 10) : parseFloat(str);
            }
            return str;
        };
        request(feedUrl, function (error, response, xml) {
            if (!error && response.statusCode == 200) {
                res.json(xml);
            }
            else {
                res.statusCode = 404;
                res.end();
            }
        });
    };
    return RestAPI;
})(BaseConnector.BaseConnector);
exports.RestAPI = RestAPI;
//# sourceMappingURL=RestAPI.js.map