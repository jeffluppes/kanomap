var MobileLayer;
(function (MobileLayer_1) {
    var MobileLayer = (function () {
        function MobileLayer(manager, layerId, typeUrl, server, messageBus, connection) {
            var _this = this;
            this.manager = manager;
            this.connection = connection;
            if (manager) {
                manager.deleteLayer(layerId, {}, function (cb) {
                    _this.layer = {
                        id: layerId,
                        type: "dynamicgeojson",
                        isDynamic: true,
                        typeUrl: typeUrl,
                        tags: ['mobile'],
                        features: [],
                        storage: 'file'
                    };
                    manager.addUpdateLayer(_this.layer, {}, function (cb) {
                        console.log('init layer');
                    });
                });
            }
            else {
                console.log('no manager');
            }
        }
        return MobileLayer;
    })();
    MobileLayer_1.MobileLayer = MobileLayer;
})(MobileLayer || (MobileLayer = {}));
module.exports = MobileLayer;
//# sourceMappingURL=MobileLayer.js.map