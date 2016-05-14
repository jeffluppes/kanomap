var Utils = require("../helpers/Utils");
var stream = require('stream');
var GeoJsonFeaturesTransformer = (function () {
    function GeoJsonFeaturesTransformer(title) {
        this.title = title;
        this.type = "GeoJsonFeaturesTransformer";
        this.headers = null;
        this.id = Utils.newGuid();
    }
    GeoJsonFeaturesTransformer.prototype.initialize = function (opt, callback) {
        callback(null);
    };
    GeoJsonFeaturesTransformer.prototype.create = function (config, opt) {
        var t = new stream.Transform();
        var split = -1;
        var headers = this.headers;
        t.setEncoding("utf8");
        t._transform = function (chunk, encoding, done) {
            /*console.log(chunk.toString("utf8"));*/
            var line = chunk.toString("utf8");
            if (!line || line.trim() == "") {
                console.log("Empty line, ignore");
                done();
                return;
            }
            try {
                var geoJson = JSON.parse(line);
            }
            catch (err) {
                console.error("Error parsing input feature:" + err);
                done();
                return;
            }
            if (geoJson.features.length > 0) {
                geoJson.features.forEach(function (f) {
                    t.push(JSON.stringify(f));
                });
            }
            done();
        };
        return t;
    };
    return GeoJsonFeaturesTransformer;
})();
module.exports = GeoJsonFeaturesTransformer;
//# sourceMappingURL=GeoJsonFeaturesTransformer.js.map