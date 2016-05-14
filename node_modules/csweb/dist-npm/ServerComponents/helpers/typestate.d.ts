export declare class Transitions<T> {
    fsm: FiniteStateMachine<T>;
    constructor(fsm: FiniteStateMachine<T>);
    fromStates: T[];
    toStates: T[];
    to(...states: T[]): TransitionFunctions<T>;
    toAny(states: any): void;
}
export declare class TransitionFunction<T> {
    fsm: FiniteStateMachine<T>;
    from: T;
    to: T;
    constructor(fsm: FiniteStateMachine<T>, from: T, to: T);
}
export declare class TransitionFunctions<T> extends Array<TransitionFunction<T>> {
    private fsm;
    constructor(fsm: FiniteStateMachine<T>);
    on(trigger: number, callback?: (from: T, to: T) => any): void;
}
export declare class FiniteStateMachine<T> {
    currentState: T;
    private _startState;
    private _transitionFunctions;
    private _onCallbacks;
    private _exitCallbacks;
    private _enterCallbacks;
    private _triggers;
    constructor(startState: T);
    addTransitions(fcn: Transitions<T>): TransitionFunctions<T>;
    addEvent(trigger: number, fromState: T, toState: T): void;
    trigger(trigger: number, options?: Object): void;
    on(state: T, callback: (from?: T, to?: T) => any): FiniteStateMachine<T>;
    onEnter(state: T, callback: (from?: T, options?: Object) => boolean): FiniteStateMachine<T>;
    onExit(state: T, callback: (to?: T, options?: Object) => boolean): FiniteStateMachine<T>;
    from(...states: T[]): Transitions<T>;
    fromAny(states: any): Transitions<T>;
    private _validTransition(from, to);
    canGo(state: T): boolean;
    go(state: T, options?: Object): void;
    onTransition(from: T, to: T, options?: Object): void;
    reset(): void;
    private _transitionTo(state, options?);
}
