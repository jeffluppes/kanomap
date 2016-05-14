var request = require("request");
var async = require("async");
var split = require("split");
var es = require('event-stream');
var ImporterRepositoryService = (function () {
    function ImporterRepositoryService(store) {
        this.store = store;
        this.transformers = [];
    }
    ImporterRepositoryService.prototype.init = function (apiServiceManager, server, config) {
        var _this = this;
        this.server = server;
        this.config = config;
        this.baseUrl = apiServiceManager.BaseUrl + config['importAddress'] || '/importers';
        server.get(this.baseUrl, function (req, res) {
            var importers = _this.getAll();
            res.send(importers);
        });
        server.get(this.baseUrl + "/transformers", function (req, res) {
            var transformers = _this.getAllTransformers();
            var strippedTransformers = [];
            transformers.forEach(function (t) {
                var stripped = {
                    id: t.id,
                    title: t.title,
                    description: t.description,
                    type: t.type
                };
                strippedTransformers.push(stripped);
            });
            res.send(strippedTransformers);
        });
        server.post(this.baseUrl, function (req, res) {
            var importer = req.body;
            console.log(importer);
            res.send(_this.create(null, importer));
        });
        server.get(this.baseUrl + '/:id', function (req, res) {
            var id = req.params.id;
            res.send(_this.get(id));
        });
        server.get(this.baseUrl + '/:id/run', function (req, res) {
            var id = req.params.id;
            var importer = _this.get(id);
            importer.lastRun = new Date();
            _this.runImporter(importer, function (error) {
                res.send("");
            });
        });
        server.put(this.baseUrl + '/:id', function (req, res) {
            var id = req.params.id;
            var importer = req.body;
            res.send(_this.update(importer));
        });
        server.delete(this.baseUrl + '/:id', function (req, res) {
            var id = req.params.id;
            res.send(_this.delete(id));
        });
    };
    ImporterRepositoryService.prototype.shutdown = function () {
    };
    ImporterRepositoryService.prototype.runImporter = function (importer, callback) {
        var _this = this;
        var instances = [];
        async.each(importer.transformers, function (transformerDefinition, next) {
            var transformerInstance = _this.getTransformerInstance(transformerDefinition);
            if (!transformerInstance) {
                next(new Error("Unknown transformer type: " + transformerDefinition.type));
                return;
            }
            instances.push(transformerInstance);
            transformerInstance.initialize(transformerDefinition, function (error) {
                if (error) {
                    next(error);
                    return;
                }
                next();
            });
        }, function (error) {
            if (error) {
                console.log("Error initalizing transformers: " + error);
                return;
            }
            console.log("Transformers initialized");
            var sourceRequest = request({ url: importer.sourceUrl });
            var stream = sourceRequest.pipe(split());
            instances.forEach(function (transformerInstance) {
                if (stream) {
                    stream = stream.pipe(transformerInstance.create(_this.config));
                }
                else {
                    stream = sourceRequest.pipe(transformerInstance.create(_this.config));
                }
            });
            var index = 0;
            var startTs = new Date();
            var prevTs = new Date();
            stream.on("end", function () {
                var currTs = new Date();
                var diff = (currTs.getTime() - startTs.getTime()) / 1000;
                console.log(new Date() + ": Finished in " + diff + " seconds");
                if (callback) {
                    callback(null);
                }
            });
            stream.pipe(es.mapSync(function (data) {
                var currTs = new Date();
                var diff = (currTs.getTime() - prevTs.getTime());
                if ((index % 100) == 0) {
                    console.log(new Date() + ": " + index + "(" + diff / 100 + "ms per feature)");
                    prevTs = currTs;
                }
                index++;
            }));
            console.log(new Date() + ": Started");
        });
    };
    ImporterRepositoryService.prototype.addTransformer = function (transformer) {
        this.transformers.push(transformer);
    };
    ImporterRepositoryService.prototype.getTransformerInstance = function (transformerDefinition) {
        var transformer = this.transformers.filter(function (t) { return t.type == transformerDefinition.type; })[0];
        var instance = Object.create(transformer);
        return instance;
    };
    ImporterRepositoryService.prototype.getAllTransformers = function () {
        return this.transformers;
    };
    ImporterRepositoryService.prototype.getAll = function () {
        return this.store.getAll();
    };
    ImporterRepositoryService.prototype.get = function (id) {
        return this.store.get(id);
    };
    ImporterRepositoryService.prototype.create = function (id, importer) {
        return this.store.create(id, importer);
    };
    ImporterRepositoryService.prototype.delete = function (id) {
        this.store.delete(id);
    };
    ImporterRepositoryService.prototype.update = function (importer) {
        this.store.update(null, importer);
    };
    return ImporterRepositoryService;
})();
module.exports = ImporterRepositoryService;
//# sourceMappingURL=ImporterRepositoryService.js.map