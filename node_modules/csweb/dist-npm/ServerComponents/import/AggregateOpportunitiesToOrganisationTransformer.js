var Utils = require("../helpers/Utils");
var stream = require('stream');
var request = require("request");
var AggregateOpportunitiesToOrganisationTransformer = (function () {
    function AggregateOpportunitiesToOrganisationTransformer(title) {
        this.title = title;
        this.type = "AggregateOpportunitiesToOrganisationTransformer";
        this.id = Utils.newGuid();
    }
    AggregateOpportunitiesToOrganisationTransformer.prototype.initialize = function (opt, callback) {
        var _this = this;
        var urlParameter = opt.parameters.filter(function (p) { return p.type.title == "opportunitiesUrl"; })[0];
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
            console.log("Opportunity Geojson loaded: " + _this.geometry.features.length + " features");
            callback(null);
        });
    };
    AggregateOpportunitiesToOrganisationTransformer.prototype.create = function (config, opt) {
        var _this = this;
        var t = new stream.Transform();
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
            console.log("Start aggregation");
            var organisatieOpportunities = _this.geometry.features.filter(function (f) { return f.properties[_this.keyProperty] == feature.properties[_this.keyProperty]; });
            var aggregateProperties = organisatieOpportunities.map(function (value, index, array) {
                var brutoOmvang = value.properties.brutoOmvang;
                var kans = value.properties.kans;
                return {
                    kans: kans,
                    brutoOmvang: brutoOmvang,
                    nettoOmvang: brutoOmvang * (kans / 100),
                    opportunityManager: value.properties.OpportunityManager
                };
            });
            var aggregatedOpportunities = aggregateProperties.reduce(function (previousValue, currentValue, currentIndex, array) {
                previousValue.kans_min = Math.min(previousValue.kans_min, currentValue.kans);
                previousValue.kans_max = Math.max(previousValue.kans_max, currentValue.kans);
                previousValue.kans_totaal += currentValue.kans;
                previousValue.brutoOmvang_min = Math.min(previousValue.brutoOmvang_min, currentValue.brutoOmvang);
                previousValue.brutoOmvang_max = Math.max(previousValue.brutoOmvang_max, currentValue.brutoOmvang);
                previousValue.brutoOmvang_totaal += currentValue.brutoOmvang;
                previousValue.nettoOmvang_min = Math.min(previousValue.nettoOmvang_min, currentValue.nettoOmvang);
                previousValue.nettoOmvang_max = Math.max(previousValue.nettoOmvang_max, currentValue.nettoOmvang);
                previousValue.nettoOmvang_totaal += currentValue.nettoOmvang;
                if (currentValue.opportunityManager && previousValue.opportunityManagers.indexOf(currentValue.opportunityManager) < 0) {
                    previousValue.opportunityManagers.push(currentValue.opportunityManager);
                }
                previousValue.aantalOpportunities++;
                return previousValue;
            }, {
                kans_min: Number.MAX_VALUE,
                kans_max: Number.MIN_VALUE,
                kans_totaal: 0,
                brutoOmvang_min: Number.MAX_VALUE,
                brutoOmvang_max: Number.MIN_VALUE,
                brutoOmvang_totaal: 0,
                nettoOmvang_min: Number.MAX_VALUE,
                nettoOmvang_max: Number.MIN_VALUE,
                nettoOmvang_totaal: 0,
                aantalOpportunities: 0,
                opportunityManagers: [],
            });
            aggregatedOpportunities.kans_gemiddeld = aggregatedOpportunities.kans_totaal / aggregatedOpportunities.aantalOpportunities;
            aggregatedOpportunities.brutoOmvang_gemiddeld = aggregatedOpportunities.brutoOmvang_totaal / aggregatedOpportunities.aantalOpportunities;
            aggregatedOpportunities.nettoOmvang_gemiddeld = aggregatedOpportunities.nettoOmvang_totaal / aggregatedOpportunities.aantalOpportunities;
            console.log("Aggregation finished");
            console.log(aggregatedOpportunities);
            for (var field in aggregatedOpportunities) {
                feature.properties[field] = aggregatedOpportunities[field];
            }
            t.push(JSON.stringify(feature));
            done();
        };
        return t;
    };
    return AggregateOpportunitiesToOrganisationTransformer;
})();
module.exports = AggregateOpportunitiesToOrganisationTransformer;
//# sourceMappingURL=AggregateOpportunitiesToOrganisationTransformer.js.map