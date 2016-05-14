var Utils = require("../helpers/Utils");
var stream = require('stream');
var BagDatabase = require("../database/BagDatabase");
var IBagOptions = require('../database/IBagOptions');
var BagDetailsTransformer = (function () {
    function BagDetailsTransformer(title) {
        this.title = title;
        this.type = "BagDetailsTransformer";
        this.id = Utils.newGuid();
    }
    BagDetailsTransformer.prototype.initialize = function (opt, callback) {
        callback(null);
    };
    BagDetailsTransformer.prototype.create = function (config, opt) {
        if (!config) {
            console.error("Configuration service instance is required");
            return null;
        }
        var t = new stream.Transform();
        var bagDb = new BagDatabase.BagDatabase(config);
        var index = 1;
        var prevTs = new Date();
        t.setEncoding("utf8");
        t._transform = function (chunk, encoding, done) {
            /*console.log(".");*/
            if (index % 100 == 0) {
                var currTs = new Date();
                console.log(new Date() + ": " + index + " entries processed; " + ((currTs.getTime() - prevTs.getTime()) / 1000 / 100) + "s per feature");
                prevTs = currTs;
            }
            var feature = JSON.parse(chunk);
            var huisnummer = feature.properties.huisnummer;
            var postcode = feature.properties.postcode;
            if (!huisnummer || !postcode) {
                done();
                return;
            }
            try {
                bagDb.lookupBagAddress(postcode, huisnummer, IBagOptions.All, function (addresses) {
                    if (!addresses || !(addresses[0])) {
                        console.log("Address not found: " + postcode + " " + huisnummer);
                        done();
                        return;
                    }
                    var firstAddress = addresses[0];
                    feature.geometry = {
                        "type": "Point",
                        "coordinates": [firstAddress.lon, firstAddress.lat]
                    };
                    feature.properties.woonplaats = firstAddress.woonplaatsnaam;
                    feature.properties.gemeentenaam = firstAddress.gemeentenaam;
                    feature.properties.provincienaam = firstAddress.provincienaam;
                    t.push(JSON.stringify(feature));
                    done();
                });
            }
            catch (error) {
                console.log("Error querying bag: " + error);
                index++;
                prevTs = currTs;
            }
            index++;
        };
        return t;
    };
    return BagDetailsTransformer;
})();
module.exports = BagDetailsTransformer;
//# sourceMappingURL=BagDetailsTransformer.js.map