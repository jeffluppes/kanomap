var Utils = require("../helpers/Utils");
var stream = require('stream');
var request = require("request");
var turf = require("turf");
var MergeGeoJsonTransformer = (function () {
    function MergeGeoJsonTransformer(title) {
        this.title = title;
        this.type = "MergeGeoJsonTransformer";
        this.id = Utils.newGuid();
    }
    MergeGeoJsonTransformer.prototype.initialize = function (opt, callback) {
        var _this = this;
        var featuresToMergeUrlProperty = opt.parameters.filter(function (p) { return p.type.title == "featuresToMergeUrl"; })[0];
        if (!featuresToMergeUrlProperty) {
            callback("feature url missing");
            return;
        }
        var keyPropertyParameter = opt.parameters.filter(function (p) { return p.type.title == "keyProperty"; })[0];
        if (!keyPropertyParameter) {
            callback("key property missing");
            return;
        }
        this.keyProperty = keyPropertyParameter.value;
        request({ url: featuresToMergeUrlProperty.value }, function (error, response, body) {
            if (error) {
                callback(error);
                return;
            }
            _this.geometry = JSON.parse(body);
            console.log("Merge geojson loaded");
            callback(null);
        });
    };
    MergeGeoJsonTransformer.prototype.create = function (config, opt) {
        var _this = this;
        var t = new stream.Transform();
        var baseGeo;
        t.setEncoding("utf8");
        t._transform = function (chunk, encoding, done) {
            var feature = JSON.parse(chunk);
            var featureKeyValue = feature.properties[_this.keyProperty];
            var mergeFeature = _this.geometry.features.filter(function (f) { return f.properties[_this.keyProperty] == featureKeyValue; })[0];
            if (!mergeFeature) {
                console.log("No merge feature found based on " + _this.keyProperty + "=" + featureKeyValue);
                done();
                return;
            }
            for (var field in mergeFeature.properties) {
                feature.properties[field] = mergeFeature.properties[field];
            }
            feature.geometry = mergeFeature.geometry;
            t.push(JSON.stringify(feature));
            done();
        };
        return t;
    };
    return MergeGeoJsonTransformer;
})();
module.exports = MergeGeoJsonTransformer;
//# sourceMappingURL=MergeGeoJsonTransformer.js.map