(function (InputDataType) {
    InputDataType[InputDataType["file"] = 0] = "file";
    InputDataType[InputDataType["url"] = 1] = "url";
    InputDataType[InputDataType["mongo"] = 2] = "mongo";
    InputDataType[InputDataType["pg"] = 3] = "pg";
    InputDataType[InputDataType["shape"] = 4] = "shape";
    InputDataType[InputDataType["geojson"] = 5] = "geojson";
    InputDataType[InputDataType["zip"] = 6] = "zip";
})(exports.InputDataType || (exports.InputDataType = {}));
var InputDataType = exports.InputDataType;
(function (OutputDataType) {
    OutputDataType[OutputDataType["file"] = 0] = "file";
    OutputDataType[OutputDataType["geojson"] = 1] = "geojson";
    OutputDataType[OutputDataType["mongo"] = 2] = "mongo";
    OutputDataType[OutputDataType["pg"] = 3] = "pg";
})(exports.OutputDataType || (exports.OutputDataType = {}));
var OutputDataType = exports.OutputDataType;
//# sourceMappingURL=ITransform.js.map