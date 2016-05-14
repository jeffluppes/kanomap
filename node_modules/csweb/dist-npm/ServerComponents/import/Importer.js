var Utils = require("../helpers/Utils");
var RepeatEnum = require("./RepeatEnum");
var BaseImport = (function () {
    function BaseImport() {
        this.tags = {};
        this.transformers = [];
        this.repeat = RepeatEnum.never;
        this.id = Utils.newGuid();
    }
    return BaseImport;
})();
exports.BaseImport = BaseImport;
//# sourceMappingURL=Importer.js.map