var request = require('request');
var AccessibilityService = (function () {
    function AccessibilityService() {
    }
    AccessibilityService.prototype.init = function (apiServiceManager, server, config) {
        var _this = this;
        this.server = server;
        this.baseUrl = apiServiceManager.BaseUrl + (config['accessibilityAddress'] || '/accessibility');
        server.get(this.baseUrl, function (req, res) {
            var id = req.query.url;
            _this.getAccessibility(id, res);
        });
    };
    AccessibilityService.prototype.shutdown = function () { };
    AccessibilityService.prototype.getAccessibility = function (url, res) {
        console.log('Accessibility request: ' + url);
        var options = {
            url: url,
            headers: { 'Accept': 'application/json' }
        };
        request(options, function (error, response) {
            if (!error && response.statusCode == 200) {
                res.json(response);
            }
            else {
                res.statusCode = 404;
                res.end();
            }
        });
    };
    return AccessibilityService;
})();
exports.AccessibilityService = AccessibilityService;
//# sourceMappingURL=AccessibilityService.js.map