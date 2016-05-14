var express = require('express');
var path = require('path');
var Winston = require('winston');
var csweb = require('./index');
var csServerOptions = (function () {
    function csServerOptions() {
        this.port = 3002;
    }
    return csServerOptions;
})();
exports.csServerOptions = csServerOptions;
var csServer = (function () {
    function csServer(dir, options) {
        if (options === void 0) { options = new csServerOptions(); }
        this.dir = dir;
        this.options = options;
        this.server = express();
    }
    csServer.prototype.start = function (started) {
        var _this = this;
        var favicon = require('serve-favicon');
        var bodyParser = require('body-parser');
        this.httpServer = require('http').Server(this.server);
        this.cm = new csweb.ConnectionManager(this.httpServer);
        this.messageBus = new csweb.MessageBusService();
        this.config = new csweb.ConfigurationService('./configuration.json');
        this.options.port = this.options.port;
        this.server.set('port', this.options.port);
        this.server.use(favicon(this.dir + '/public/favicon.ico'));
        this.server.use(bodyParser.json({ limit: '25mb' }));
        this.server.use(bodyParser.urlencoded({ limit: '25mb', extended: true }));
        this.config.add('server', 'http://localhost:' + this.options.port);
        var bagDatabase = new csweb.BagDatabase(this.config);
        this.server.use(express.static(path.join(this.dir, 'swagger')));
        this.server.use(express.static(path.join(this.dir, 'public')));
        this.httpServer.listen(this.server.get('port'), function () {
            Winston.info('Express server listening on port ' + _this.server.get('port'));
            _this.api = new csweb.ApiManager('cs', 'cs');
            _this.api.init(path.join(path.resolve(_this.dir), 'public/data/api'), function () {
                _this.api.addConnectors([
                    { key: 'rest', s: new csweb.RestAPI(_this.server), options: {} },
                    { key: 'mqtt', s: new csweb.MqttAPI('localhost', 1883), options: {} },
                    { key: 'file', s: new csweb.FileStorage(path.join(path.resolve(_this.dir), 'public/data/api/')), options: {} },
                    { key: 'socketio', s: new csweb.SocketIOAPI(_this.cm), options: {} },
                    { key: 'mongo', s: new csweb.MongoDBStorage('127.0.0.1', 27017), options: {} }
                ], function () {
                    started();
                });
                var mapLayerFactory = new csweb.MapLayerFactory(bagDatabase, _this.messageBus, _this.api);
                _this.server.post('/projecttemplate', function (req, res) { return mapLayerFactory.process(req, res); });
                _this.server.post('/bagcontours', function (req, res) { return mapLayerFactory.processBagContours(req, res); });
            });
        });
    };
    return csServer;
})();
exports.csServer = csServer;
//# sourceMappingURL=csServer.js.map