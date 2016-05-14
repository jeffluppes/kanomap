var Utils = require("../helpers/Utils");
var stream = require('stream');
var turf = require("turf");
var GeoJsonOutputTransformer = (function () {
    function GeoJsonOutputTransformer(title) {
        this.title = title;
        this.type = "GeoJsonOutputTransformer";
        this.geoJson = [];
        this.id = Utils.newGuid();
    }
    GeoJsonOutputTransformer.prototype.initialize = function (opt, callback) {
        callback(null);
    };
    GeoJsonOutputTransformer.prototype.create = function (config, opt) {
        var _this = this;
        var t = new stream.Transform();
        this.geoJson = [];
        t.setEncoding("utf8");
        t._transform = function (chunk, encoding, done) {
            var feature = JSON.parse(chunk);
            _this.geoJson.push(feature);
            done();
        };
        t._flush = function (done) {
            try {
                console.log("#### start GJOT flush");
                var result = {
                    type: "FeatureCollection",
                    features: _this.geoJson
                };
                console.log("nFeatures: " + result.features.length);
                var strResult = JSON.stringify(result);
                t.push(strResult);
                _this.geoJson = [];
                done();
            }
            catch (error) {
                console.log("#### GJOT flush error: " + error);
                done();
            }
        };
        return t;
    };
    return GeoJsonOutputTransformer;
})();
module.exports = GeoJsonOutputTransformer;
//# sourceMappingURL=GeoJsonOutputTransformer.js.map