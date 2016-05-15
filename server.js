var Winston = require('winston');
var csweb = require("csweb");
Winston.remove(Winston.transports.Console);
Winston.add(Winston.transports.Console, {
    colorize: true,
    label: 'csWeb',
    prettyPrint: true
});
var cs = new csweb.csServer(__dirname, {
    port: 3003
});
cs.start(function () {
    console.log('started');
    //    //{ key: "imb", s: new ImbAPI.ImbAPI("app-usdebug01.tsn.tno.nl", 4000),options: {} }
    //    var ml = new MobileLayer.MobileLayer(api, "mobilelayer", "/api/resources/SGBO", server, messageBus, cm);
});
//# sourceMappingURL=server.js.map