var fs = require('fs');
var path = require('path');
var ProjectRepositoryService = (function () {
    function ProjectRepositoryService(store) {
        this.store = store;
    }
    ProjectRepositoryService.prototype.init = function (apiServiceManager, server, config) {
        var _this = this;
        this.server = server;
        this.config = config;
        this.resourceTypeUrl = apiServiceManager.BaseUrl + (config['resourceTypeAddress'] || '/resourceTypes');
        this.dataUrl = apiServiceManager.DataUrl + (config['resourceTypeAddress'] || '/resourceTypes');
        this.projectUrl = apiServiceManager.DataUrl + '/projects';
        server.get(this.resourceTypeUrl, function (req, res) {
            var resourceTypes = _this.getAll();
            res.send(resourceTypes);
        });
        server.post(this.projectUrl + '/:id', function (req, res) {
            var id = req.params.id;
            var project = req.body;
            console.log('Saving posted project file (project.json): ' + id);
            var filename = path.join(path.dirname(require.main.filename), 'public/data/projects', id, 'project.json');
            if (fs.exists(filename)) {
                var backupFilename = path.join(path.dirname(require.main.filename), 'public/data/projects', id, _this.yyyymmdd() + 'project.json');
                var date = Date();
                fs.rename(filename, backupFilename, function (err) {
                    console.error(err);
                });
            }
            fs.writeFile(filename, JSON.stringify(project, null, 2), function (err) {
                if (err) {
                    console.error(err);
                }
            });
            res.end();
        });
        server.post(this.resourceTypeUrl + '/:id', function (req, res) {
            var id = req.params.id;
            if (!_this.endsWith(id, ".json"))
                id += ".json";
            var resourceType = req.body;
            console.log(resourceType);
            res.send(_this.create(id, resourceType));
        });
        server.get(this.dataUrl + '/:id', function (req, res) {
            var id = req.params.id;
            _this.get(id, res);
        });
        server.put(this.resourceTypeUrl + '/:id', function (req, res) {
            var id = req.params.id;
            var resourceType = req.body;
            res.send(_this.update(id, resourceType));
        });
        server.delete(this.resourceTypeUrl + '/:id', function (req, res) {
            var id = req.params.id;
            res.send(_this.delete(id));
        });
    };
    ProjectRepositoryService.prototype.endsWith = function (str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    };
    ;
    ProjectRepositoryService.prototype.yyyymmdd = function () {
        var date = new Date();
        var yyyy = date.getFullYear().toString();
        var mm = (date.getMonth() + 1).toString();
        var dd = date.getDate().toString();
        return yyyy + (mm[1] ? mm : "0" + mm[0]) + (dd[1] ? dd : "0" + dd[0]);
    };
    ProjectRepositoryService.prototype.shutdown = function () {
    };
    ProjectRepositoryService.prototype.getAll = function () {
        return this.store.getAll();
    };
    ProjectRepositoryService.prototype.get = function (id, res) {
        this.store.getAsync(id, res);
    };
    ProjectRepositoryService.prototype.create = function (id, resourceType) {
        return this.store.create(id, resourceType);
    };
    ProjectRepositoryService.prototype.delete = function (id) {
        this.store.delete(id);
    };
    ProjectRepositoryService.prototype.update = function (id, newObject) {
        this.store.update(id, newObject);
    };
    return ProjectRepositoryService;
})();
module.exports = ProjectRepositoryService;
//# sourceMappingURL=ProjectRepositoryService.js.map