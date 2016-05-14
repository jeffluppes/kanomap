var Utils = require("../helpers/Utils");
var stream = require('stream');
var request = require("request");
var turf = require("turf");
var AggregateOpportunitiesToGeoJsonTransformer = (function () {
    function AggregateOpportunitiesToGeoJsonTransformer(title) {
        this.title = title;
        this.type = "AggregateOpportunitiesToGeoJsonTransformer";
        this.id = Utils.newGuid();
    }
    AggregateOpportunitiesToGeoJsonTransformer.prototype.initialize = function (opt, callback) {
        var _this = this;
        var urlParameter = opt.parameters.filter(function (p) { return p.type.title == "aggregateShapeUrl"; })[0];
        if (!urlParameter) {
            callback("opportunitiesUrl missing");
            return;
        }
        var parameter = opt.parameters.filter(function (p) { return p.type.title == "keyProperty"; })[0];
        if (!parameter) {
            callback("keyProperty missing");
            return;
        }
        this.keyProperty = parameter.value;
        request({ url: urlParameter.value }, function (error, response, body) {
            if (error) {
                callback(error);
                return;
            }
            _this.geometry = JSON.parse(body);
            console.log("Geojson loaded: " + _this.geometry.features.length + " features");
            callback(null);
        });
    };
    AggregateOpportunitiesToGeoJsonTransformer.prototype.create = function (config, opt) {
        var _this = this;
        var t = new stream.Transform();
        var accumulator = {};
        var index = 0;
        t.setEncoding("utf8");
        t._transform = function (chunk, encoding, done) {
            var startTs = new Date();
            if (!_this.geometry) {
                console.log("No target geometry found");
                done();
                return;
            }
            var feature = JSON.parse(chunk);
            var found = false;
            _this.geometry.features.forEach(function (f) {
                if (found)
                    return;
                if (turf.inside(feature, f)) {
                    var keyValue = f.properties[_this.keyProperty];
                    var accEntry = accumulator[keyValue];
                    if (accEntry) {
                        accEntry.kans_min = Math.min(accEntry.kans_min, feature.properties.kans);
                        accEntry.kans_max = Math.max(accEntry.kans_max, feature.properties.kans);
                        accEntry.kans_totaal += feature.properties.kans;
                        accEntry.brutoOmvang_min = Math.min(accEntry.brutoOmvang_min, feature.properties.brutoOmvang);
                        accEntry.brutoOmvang_max = Math.max(accEntry.brutoOmvang_max, feature.properties.brutoOmvang);
                        accEntry.brutoOmvang_totaal += feature.properties.brutoOmvang;
                        var nettoOmvang = feature.properties.brutoOmvang * feature.properties.kans;
                        accEntry.nettoOmvang_min = Math.min(accEntry.nettoOmvang_min, nettoOmvang);
                        accEntry.nettoOmvang_max = Math.max(accEntry.nettoOmvang_max, nettoOmvang);
                        accEntry.nettoOmvang_totaal += nettoOmvang;
                        if (feature.properties.OpportunityManager && accEntry.opportunityManagers.indexOf(feature.properties.OpportunityManager) < 0) {
                            accEntry.opportunityManagers.push(feature.properties.OpportunityManager);
                        }
                        accEntry.aantalOpportunities++;
                    }
                    else {
                        accEntry = { feature: f };
                        accEntry.kans_totaal = accEntry.kans_max = accEntry.kans_min = feature.properties.kans;
                        accEntry.brutoOmvang_totaal = accEntry.brutoOmvang_max = accEntry.brutoOmvang_min = feature.properties.brutoOmvang;
                        var nettoOmvang = feature.properties.brutoOmvang * feature.properties.kans;
                        accEntry.nettoOmvang_min = accEntry.nettoOmvang_max = accEntry.nettoOmvang_totaal = nettoOmvang;
                        accEntry.opportunityManagers = [feature.properties.OpportunityManager];
                        accEntry.aantalOpportunities = 1;
                        accumulator[keyValue] = accEntry;
                    }
                    found = true;
                }
            });
            if (!found) {
                console.log("feature " + feature.properties.name + " could not be aggregated, town: " + feature.properties.town + ". " + feature.geometry.coordinates);
            }
            done();
        };
        t._flush = function (done) {
            try {
                console.log("#### start AOTGJT flush");
                for (var key in accumulator) {
                    console.log(key);
                    var featureAcc = accumulator[key];
                    featureAcc.feature.properties.kans_min = featureAcc.kans_min;
                    featureAcc.feature.properties.kans_max = featureAcc.kans_max;
                    featureAcc.feature.properties.kans_totaal = featureAcc.kans_totaal;
                    featureAcc.feature.properties.kans_gemiddeld = featureAcc.kans_totaal / featureAcc.aantalOpportunities;
                    featureAcc.feature.properties.brutoOmvang_min = featureAcc.brutoOmvang_min;
                    featureAcc.feature.properties.brutoOmvang_max = featureAcc.brutoOmvang_max;
                    featureAcc.feature.properties.brutoOmvang_totaal = featureAcc.brutoOmvang_totaal;
                    featureAcc.feature.properties.brutoOmvang_gemiddeld = featureAcc.brutoOmvang_totaal / featureAcc.aantalOpportunities;
                    featureAcc.feature.properties.nettoOmvang_min = featureAcc.nettoOmvang_min;
                    featureAcc.feature.properties.nettoOmvang_max = featureAcc.nettoOmvang_max;
                    featureAcc.feature.properties.nettoOmvang_totaal = featureAcc.nettoOmvang_totaal;
                    featureAcc.feature.properties.nettoOmvang_gemiddeld = featureAcc.nettoOmvang_totaal / featureAcc.aantalOpportunities;
                    featureAcc.feature.properties.opportunityManagers = featureAcc.opportunityManagers;
                    featureAcc.feature.properties.aantalOpportunities = featureAcc.aantalOpportunities;
                    t.push(JSON.stringify(featureAcc.feature));
                }
                done();
            }
            catch (error) {
                console.log("Agg error: " + error);
                done();
            }
        };
        return t;
    };
    return AggregateOpportunitiesToGeoJsonTransformer;
})();
module.exports = AggregateOpportunitiesToGeoJsonTransformer;
//# sourceMappingURL=AggregateOpportunitiesToGeoJsonTransformer.js.map