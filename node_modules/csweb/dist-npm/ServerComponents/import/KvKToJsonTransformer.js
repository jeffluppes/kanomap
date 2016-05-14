var Utils = require("../helpers/Utils");
var stream = require('stream');
var splitStream = require("split");
var KvKToJsonTransformer = (function () {
    function KvKToJsonTransformer(title) {
        this.title = title;
        this.type = "KvKToJsonTransformer";
        this.headers = null;
        this.id = Utils.newGuid();
    }
    KvKToJsonTransformer.prototype.initialize = function (opt, callback) {
        this.headers = ["Registerletter", "Dossiernummer", "Subdossiernummer", "Vestigingsnummer", "Handelsnaam", "adres", "pc_plaats", "adres_CA", "pc_plaats_CA", "Handelsnaam1x2x30", "Handelsnaam2x2x30", "Handelsnaam1x45", "postcode", "postcode_CA", "BeherendKamer-nummer", "GeografischKamer-nummer", "BoekjaarDeponeringJaarstuk", "DatumOpheffing", "DatumOprichting", "DatumVestiging", "DatumVestigingHuidigAdres", "Domeinnaam", "HoofdzaakFiliaalIndicatie", "IndicatieEconomischActief", "NonMailingindicator", "Rechtsvorm", "RSIN", "Telefoonnummer", "gemeentecode", "HoofdactiviteitenCode", "NevenactiviteitenCode1", "NevenactiviteitenCode2", "HoofdactiviteitenOmschrijving", "HandelsnaamVolledig", "VennootschapnaamVolledig", "straat", "huisnummer", "toevoeging", "postcode", "woonplaats", "straat_CA", "huisnummer_CA", "toevoeging_CA", "postcode_CA", "woonplaats_CA"];
        callback(null);
    };
    KvKToJsonTransformer.prototype.create = function (config, opt) {
        var t = new stream.Transform();
        var split = -1;
        var headers = this.headers;
        t.setEncoding("utf8");
        t._transform = function (chunk, encoding, done) {
            // console.log("##### KvKTJT #####");
            // console.log(chunk.toString("utf8"));
            var line = chunk.toString("utf8");
            if (!line || line.trim() == "") {
                console.log("Empty line, ignore");
                done();
                return;
            }
            var lineMod = line.slice(1, line.length - 1);
            var fields = lineMod.split(/\",\"/);
            if (!headers) {
                headers = [];
                fields.forEach(function (f) {
                    headers.push(f);
                });
                done();
            }
            else {
                var obj = { properties: {} };
                headers.forEach(function (h) {
                    var hIndex = headers.indexOf(h);
                    obj.properties[h] = fields[hIndex];
                });
                t.push(JSON.stringify(obj));
                done();
            }
        };
        return t;
    };
    return KvKToJsonTransformer;
})();
module.exports = KvKToJsonTransformer;
//# sourceMappingURL=KvKToJsonTransformer.js.map