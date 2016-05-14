var Utils = require("../helpers/Utils");
var stream = require('stream');
var fs = require("fs");
var turf = require("turf");
var GeoJsonSaveTransformer = (function () {
    function GeoJsonSaveTransformer(title) {
        this.title = title;
        this.type = "GeoJsonSaveTransformer";
        this.generateMetadata = false;
        this.generateKeysOnly = false;
        this.nameLabel = "Name";
        this.id = Utils.newGuid();
    }
    GeoJsonSaveTransformer.prototype.initialize = function (opt, callback) {
        var keyPropertyParameter = opt.parameters.filter(function (p) { return p.type.title == "filenameKeyProperty"; })[0];
        if (keyPropertyParameter) {
            this.filenameKey = keyPropertyParameter.value;
        }
        var filenameParameter = opt.parameters.filter(function (p) { return p.type.title == "filename"; })[0];
        if (filenameParameter) {
            this.filename = filenameParameter.value;
        }
        var targetFolderParameter = opt.parameters.filter(function (p) { return p.type.title == "targetFolder"; })[0];
        if (targetFolderParameter) {
            this.targetFolder = targetFolderParameter.value;
        }
        if (!this.filename && !this.filenameKey) {
            callback("Either filename or filenameKey must be specified");
            return;
        }
        var generateMetadataParameter = opt.parameters.filter(function (p) { return p.type.title == "generateMetadata"; })[0];
        if (generateMetadataParameter) {
            this.generateMetadata = generateMetadataParameter.value;
        }
        var generateKeysOnlyParameter = opt.parameters.filter(function (p) { return p.type.title == "generateKeysOnly"; })[0];
        if (generateKeysOnlyParameter) {
            this.generateKeysOnly = generateKeysOnlyParameter.value;
        }
        var nameLabelParameter = opt.parameters.filter(function (p) { return p.type.title == "nameLabel"; })[0];
        if (nameLabelParameter) {
            this.nameLabel = nameLabelParameter.value;
        }
        var featureTypeIdParameter = opt.parameters.filter(function (p) { return p.type.title == "FeatureTypeId"; })[0];
        if (featureTypeIdParameter) {
            this.FeatureTypeId = featureTypeIdParameter.value;
        }
        callback(null);
    };
    GeoJsonSaveTransformer.prototype.create = function (config, opt) {
        var _this = this;
        var t = new stream.Transform();
        var index = 0;
        t.setEncoding("utf8");
        t._transform = function (chunk, encoding, done) {
            var startTs = new Date();
            var featureCollection = JSON.parse(chunk);
            var propertyTypeData = {};
            if (_this.generateMetadata && !featureCollection.featureTypes) {
                console.log("map %O", featureCollection.features[0].properties);
                var propertyNames = Object.getOwnPropertyNames(featureCollection.features[0].properties);
                propertyNames.forEach(function (p) {
                    console.log(p);
                    var propValue = featureCollection.features[0].properties[p];
                    var isNumeric = typeof propValue === "number";
                    var result = {};
                    propertyTypeData[p] =
                        {
                            label: p,
                            title: p,
                            visibleInCallOut: true,
                            canEdit: false,
                            isSearchable: true,
                            type: isNumeric ? "number" : "string",
                            stringFormat: isNumeric ? "{0:0.0#}" : "{0}"
                        };
                });
                var typeId = _this.FeatureTypeId || "Default";
                var featureTypes = {};
                featureTypes[typeId] = {
                    "name": typeId,
                    "style": {
                        "nameLabel": _this.nameLabel,
                        "fillColor": "#ffffffff",
                        "strokeColor": "#000000",
                        "drawingMode": "Point",
                        "strokeWidth": 1,
                        "iconWidth": 32,
                        "iconHeight": 32,
                        "iconUri": "cs/images/marker.png"
                    }
                };
                console.log(JSON.stringify(featureTypes, null, 4));
                if (_this.generateKeysOnly) {
                    featureTypes[typeId].propertyTypeKeys = propertyNames.join(";");
                }
                else {
                    featureTypes[typeId].propertyTypeData = propertyTypeData;
                }
                featureCollection.featureTypes = featureTypes;
            }
            if (_this.FeatureTypeId) {
                featureCollection.features.forEach(function (f) { return f.properties["FeatureTypeId"] = _this.FeatureTypeId; });
            }
            var filename = _this.filename;
            if (_this.filenameKey) {
                filename = featureCollection.features[0].properties[_this.filenameKey] + ".json";
                filename = filename.replace(/[\/\\\|&;\$%@"<>\(\)\+,]/g, "");
            }
            if (!fs.existsSync(_this.targetFolder)) {
                console.log("Folder does not exist, create " + _this.targetFolder);
                fs.mkdirSync(_this.targetFolder);
            }
            var outputStream = fs.createWriteStream(_this.targetFolder + '/' + filename);
            outputStream.write(JSON.stringify(featureCollection));
            outputStream.close();
            console.log("Output written to " + _this.targetFolder + "/" + filename);
            t.push(JSON.stringify(featureCollection));
            done();
        };
        return t;
    };
    return GeoJsonSaveTransformer;
})();
module.exports = GeoJsonSaveTransformer;
//# sourceMappingURL=GeoJsonSaveTransformer.js.map