var fs = require('fs');
var HyperTimer = require('hypertimer');
var WorldState = require('./WorldState');
var Rule = require('./Rule');
var Api = require('../api/ApiManager');
var RuleEngine = (function () {
    function RuleEngine(manager, layerId) {
        var _this = this;
        this.loadedScripts = [];
        this.worldState = new WorldState();
        this.activeRules = [];
        this.inactiveRules = [];
        this.activateRules = [];
        this.deactivateRules = [];
        this.featureQueue = [];
        this.service = {};
        this.timer = new HyperTimer();
        manager.getLayer(layerId, {}, function (result) {
            _this.layer = result.layer;
            _this.service.updateFeature = function (feature) { return manager.updateFeature(layerId, feature, {}, function () { }); };
            _this.service.addFeature = function (feature) { return manager.addFeature(layerId, feature, {}, function () { }); };
            _this.service.updateLog = function (featureId, logs) {
                return manager.updateLogs(layerId, featureId, logs, {}, function () { });
            };
            _this.service.layer = _this.layer;
            _this.service.activateRule = function (ruleId) { return _this.activateRule(ruleId); };
            _this.service.deactivateRule = function (ruleId) { return _this.deactivateRule(ruleId); };
            _this.service.timer = _this.timer;
            _this.timer.on('error', function (err) {
                console.log('Error:', err);
            });
            manager.on(Api.Event[Api.Event.FeatureChanged], function (fc) {
                if (fc.id !== layerId)
                    return;
                console.log("Feature update with id " + fc.value.id + " and layer id " + layerId + " received in the rule engine.");
                var featureId = fc.value.id;
                _this.worldState.activeFeature = undefined;
                _this.layer.features.some(function (f) {
                    if (f.id !== featureId)
                        return false;
                    _this.worldState.activeFeature = f;
                    _this.evaluateRules(f);
                    return true;
                });
            });
        });
    }
    RuleEngine.prototype.activateRule = function (ruleId) {
        for (var i = 0; i < this.inactiveRules.length; i++) {
            var rule = this.inactiveRules[i];
            if (rule.id !== ruleId)
                continue;
            rule.isActive = true;
            this.activeRules.push(rule);
            return;
        }
    };
    RuleEngine.prototype.deactivateRule = function (ruleId) {
        for (var i = 0; i < this.activeRules.length; i++) {
            var rule = this.activeRules[i];
            if (rule.id !== ruleId)
                continue;
            rule.isActive = false;
            this.inactiveRules.push(rule);
            return;
        }
    };
    RuleEngine.prototype.isReady = function () { return this.isBusy; };
    RuleEngine.prototype.loadRules = function (filename, activationTime) {
        var _this = this;
        if (typeof activationTime === 'undefined')
            activationTime = this.timer.getTime();
        if (typeof filename === "string") {
            this.loadRuleFile(filename, activationTime);
        }
        else {
            filename.forEach(function (f) { return _this.loadRuleFile(f, activationTime); });
        }
    };
    RuleEngine.prototype.loadRuleFile = function (filename, activationTime) {
        var _this = this;
        if (this.loadedScripts.indexOf(filename) < 0)
            this.loadedScripts.push(filename);
        fs.readFile(filename, 'utf8', function (err, data) {
            if (err) {
                console.error('Error opening rules: ' + filename);
                console.error(err);
                return;
            }
            var geojson = JSON.parse(data);
            console.log("#features: " + geojson.features.length);
            geojson.features.forEach(function (f) {
                _this.worldState.features.push(f);
                if (typeof f.properties === 'undefined' || !f.properties.hasOwnProperty("_rules"))
                    return;
                var rules = f.properties["_rules"];
                rules.forEach(function (r) { return _this.addRule(r, f, activationTime); });
            });
            _this.evaluateRules();
        });
    };
    RuleEngine.prototype.addRule = function (rule, feature, activationTime) {
        if (typeof rule.actions === 'undefined' || rule.actions.length === 0 || rule.actions[0].length === 0)
            return;
        var newRule = new Rule.Rule(rule, activationTime);
        if (!rule.isGenericRule && feature) {
            newRule.feature = feature;
        }
        if (newRule.isActive)
            this.activeRules.push(newRule);
        else
            this.inactiveRules.push(newRule);
    };
    RuleEngine.prototype.evaluateRules = function (feature) {
        var _this = this;
        if (this.isBusy) {
            console.warn("Added feature ${feature.id} to the queue (#items: $this.featureQueue.length}).");
            this.featureQueue.push(feature);
            return;
        }
        this.isBusy = true;
        this.activeRules = this.activeRules.filter(function (r) { return r.isActive; });
        this.inactiveRules = this.inactiveRules.filter(function (r) { return !r.isActive; });
        console.log("Starting to evaluate " + this.activeRules.length + " rules...");
        this.worldState.activeFeature = feature;
        this.activeRules.forEach(function (r) { return r.process(_this.worldState, _this.service); });
        this.isBusy = false;
        if (this.featureQueue.length > 0) {
            var f = this.featureQueue.pop();
            this.evaluateRules(f);
        }
        console.log('Ready evaluating rules...');
    };
    return RuleEngine;
})();
exports.RuleEngine = RuleEngine;
//# sourceMappingURL=RuleEngine.js.map