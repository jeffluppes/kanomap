import Rule = require('./Rule');
import Api = require('../api/ApiManager');
import Layer = Api.Layer;
import Feature = Api.Feature;
export interface IRuleEngineService {
    updateFeature?: (feature: Feature) => void;
    addFeature?: (feature: Feature) => void;
    updateLog?: (featureId: string, msgBody: {
        [key: string]: Api.Log[];
    }) => void;
    layer?: Layer;
    activateRule?: (ruleId: string) => void;
    deactivateRule?: (ruleId: string) => void;
    timer?: HyperTimer;
}
export declare class RuleEngine {
    private loadedScripts;
    private worldState;
    private activeRules;
    private inactiveRules;
    private activateRules;
    private deactivateRules;
    private featureQueue;
    private isBusy;
    private timer;
    service: IRuleEngineService;
    layer: Api.Layer;
    constructor(manager: Api.ApiManager, layerId: string);
    activateRule(ruleId: string): void;
    deactivateRule(ruleId: string): void;
    isReady(): boolean;
    loadRules(filename: string | string[], activationTime?: Date): void;
    private loadRuleFile(filename, activationTime);
    addRule(rule: Rule.IRule, feature?: Feature, activationTime?: Date): void;
    evaluateRules(feature?: Feature): void;
}
