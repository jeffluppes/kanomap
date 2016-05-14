var Utils = require("../helpers/Utils");
var stream = require('stream');
var turf = require("turf");
var FieldSplitTransformer = (function () {
    function FieldSplitTransformer(title) {
        this.title = title;
        this.type = "FieldSplitTransformer";
        this.id = Utils.newGuid();
    }
    FieldSplitTransformer.prototype.initialize = function (opt, callback) {
        /*console.log(JSON.stringify(opt,null,4));*/
        var keyPropertyParameter = opt.parameters.filter(function (p) { return p.type.title == "keyProperty"; })[0];
        if (!keyPropertyParameter) {
            callback("keyProperty missing");
            return;
        }
        this.keyProperty = keyPropertyParameter.value;
        callback(null);
    };
    FieldSplitTransformer.prototype.create = function (config, opt) {
        var _this = this;
        var t = new stream.Transform();
        var accumulator = {};
        t.setEncoding("utf8");
        var index = 0;
        t._transform = function (chunk, encoding, done) {
            var feature = JSON.parse(chunk);
            var keyValue = feature.properties[_this.keyProperty];
            var accEntry = accumulator[keyValue];
            if (accEntry) {
                accEntry.push(feature);
            }
            else {
                accEntry = [feature];
                accumulator[keyValue] = accEntry;
            }
            done();
        };
        t._flush = function (done) {
            try {
                var keys = Object.keys(accumulator);
                keys.forEach(function (key) {
                    var group = accumulator[key];
                    var groupGeoJson = {
                        type: "FeatureCollection",
                        features: group
                    };
                    t.push(JSON.stringify(groupGeoJson));
                });
                done();
            }
            catch (error) {
                console.error(error);
                done();
            }
        };
        return t;
    };
    return FieldSplitTransformer;
})();
module.exports = FieldSplitTransformer;
//# sourceMappingURL=FieldSplitTransformer.js.map