var Utils = require("../helpers/Utils");
var stream = require('stream');
var turf = require("turf");
var FieldFilterTransformer = (function () {
    function FieldFilterTransformer(title) {
        this.title = title;
        this.type = "FieldFilterTransformer";
        this.id = Utils.newGuid();
    }
    FieldFilterTransformer.prototype.initialize = function (opt, callback) {
        var filterPropertyParameter = opt.parameters.filter(function (p) { return p.type.title == "property"; })[0];
        if (!filterPropertyParameter) {
            callback("property missing");
            return;
        }
        this.filterProperty = filterPropertyParameter.value;
        var filterValueParameter = opt.parameters.filter(function (p) { return p.type.title == "value"; })[0];
        if (!filterValueParameter) {
            callback("value missing");
            return;
        }
        if (typeof filterValueParameter.value === "string") {
            var strValue = filterValueParameter.value;
            try {
                var regExp = new RegExp(strValue);
                this.filterValue = regExp;
            }
            catch (error) {
                callback("Error parsing regex: " + strValue);
                return;
            }
        }
        else if (typeof filterValueParameter.value === "number") {
            this.filterValue = filterValueParameter.value;
            console.log(strValue + ": number");
        }
        callback(null);
    };
    FieldFilterTransformer.prototype.create = function (config, opt) {
        var _this = this;
        var t = new stream.Transform();
        var baseGeo;
        t.setEncoding("utf8");
        t._transform = function (chunk, encoding, done) {
            var feature = JSON.parse(chunk);
            if (_this.filterValue instanceof RegExp) {
                if (feature.properties[_this.filterProperty].match(_this.filterValue)) {
                    t.push(JSON.stringify(feature));
                }
                else {
                }
            }
            else if (_this.filterValue instanceof Number) {
                if (feature.properties[_this.filterProperty] == _this.filterValue) {
                    t.push(JSON.stringify(feature));
                }
                else {
                }
            }
            done();
        };
        return t;
    };
    return FieldFilterTransformer;
})();
module.exports = FieldFilterTransformer;
//# sourceMappingURL=FieldFilterTransformer.js.map