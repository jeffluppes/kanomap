import RuleEngine = require('./RuleEngine');
import WorldState = require('./WorldState');
import ApiManager = require('../api/ApiManager');
import Feature = ApiManager.Feature;
export interface IRule {
    id?: string;
    description?: string;
    activatedAt?: Date;
    isActive?: boolean;
    isGenericRule?: boolean;
    recurrence?: number;
    feature?: Feature;
    conditions?: [[string | number | boolean]];
    actions?: [[string | number | boolean]];
    process?: (worldState: WorldState, service: RuleEngine.IRuleEngineService) => void;
}
export declare class Rule implements IRule {
    id: string;
    description: string;
    activatedAt: Date;
    isGenericRule: boolean;
    isActive: boolean;
    recurrence: number;
    feature: Feature;
    conditions: [[string | number | boolean]];
    actions: [[string | number | boolean]];
    constructor(rule: IRule, activationTime?: Date);
    process(worldState: WorldState, service: RuleEngine.IRuleEngineService): void;
    private evaluateConditions(worldState);
    private showWarning(condition);
    private executeActions(worldState, service);
    private setTimerForProperty(service, key, value, delay?, isAnswer?);
    private static updateLog(f, logs, key, now, value);
    private updateProperty(f, service, key, value, isAnswer?);
    private getDelay(actions, index);
}
