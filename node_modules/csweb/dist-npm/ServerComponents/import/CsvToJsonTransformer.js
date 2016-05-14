var Utils = require("../helpers/Utils");
var stream = require('stream');
var splitStream = require("split");
var CsvToJsonTransformer = (function () {
    function CsvToJsonTransformer(title) {
        this.title = title;
        this.type = "CsvToJsonTransformer";
        this.headers = null;
        this.id = Utils.newGuid();
    }
    CsvToJsonTransformer.prototype.initialize = function (opt, callback) {
        var propertyParameter = opt.parameters.filter(function (p) { return p.type.title == "fieldDelimiter"; })[0];
        if (propertyParameter) {
            this.fieldDelimiter = propertyParameter.value;
        }
        propertyParameter = opt.parameters.filter(function (p) { return p.type.title == "textQualifier"; })[0];
        if (propertyParameter) {
            this.textQualifier = propertyParameter.value;
        }
        propertyParameter = opt.parameters.filter(function (p) { return p.type.title == "latField"; })[0];
        if (propertyParameter) {
            this.latField = propertyParameter.value;
        }
        propertyParameter = opt.parameters.filter(function (p) { return p.type.title == "longField"; })[0];
        if (propertyParameter) {
            this.longField = propertyParameter.value;
        }
        callback(null);
    };
    CsvToJsonTransformer.prototype.create = function (config, opt) {
        var _this = this;
        var t = new stream.Transform();
        var split = -1;
        var headers;
        t.setEncoding("utf8");
        t._transform = function (chunk, encoding, done) {
            /*console.log("##### CTJT #####");*/
            // console.log(chunk.toString("utf8"));
            var line = chunk.toString("utf8");
            if (!line || line.trim() == "") {
                console.log("Empty line, ignore");
                done();
                return;
            }
            var textQualifierRegExp = new RegExp("(?:\\s*(?:" + _this.textQualifier + "([^" + _this.textQualifier + "]*)" + _this.textQualifier + "|([^" + _this.fieldDelimiter + "]+))?\\s*" + _this.fieldDelimiter + "?)+?", "g");
            var fields = [];
            var result;
            var prevIndex = -1;
            while ((result = textQualifierRegExp.exec(line)).index > prevIndex) {
                var strValue = '';
                if (result[1] && result[1].length > 0) {
                    strValue = result[1];
                }
                else if (result[2] && result[2].length > 0) {
                    strValue = result[2];
                }
                if (/^\-?[0-9]*(,|\.)?[0-9]+$/.test(strValue)) {
                    fields.push(parseFloat(strValue.replace(/,/, '.')));
                }
                else {
                    fields.push(strValue);
                }
                prevIndex = result.index;
            }
            if (!headers) {
                headers = [];
                fields.filter(function (f) { return f && f != ''; }).forEach(function (f) {
                    headers.push(f.toString());
                });
                console.log(headers);
                done();
                return;
            }
            else {
                var obj = { type: "Feature", properties: {} };
                headers.forEach(function (h) {
                    var hIndex = headers.indexOf(h);
                    obj.properties[h] = fields[hIndex];
                });
                if (_this.latField && _this.longField && !obj.geometry) {
                    var lat = obj.properties[_this.longField];
                    var long = obj.properties[_this.latField];
                    obj.geometry = {
                        type: "Point",
                        coordinates: [lat, long]
                    };
                }
                t.push(JSON.stringify(obj));
                done();
            }
        };
        return t;
    };
    return CsvToJsonTransformer;
})();
module.exports = CsvToJsonTransformer;
//# sourceMappingURL=CsvToJsonTransformer.js.map