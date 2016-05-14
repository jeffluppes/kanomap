var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Transitions = (function () {
    function Transitions(fsm) {
        this.fsm = fsm;
    }
    Transitions.prototype.to = function () {
        var states = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            states[_i - 0] = arguments[_i];
        }
        this.toStates = states;
        return this.fsm.addTransitions(this);
    };
    Transitions.prototype.toAny = function (states) {
        var toStates = [];
        for (var s in states) {
            if (states.hasOwnProperty(s)) {
                toStates.push(states[s]);
            }
        }
        this.toStates = toStates;
        this.fsm.addTransitions(this);
    };
    return Transitions;
})();
exports.Transitions = Transitions;
var TransitionFunction = (function () {
    function TransitionFunction(fsm, from, to) {
        this.fsm = fsm;
        this.from = from;
        this.to = to;
    }
    return TransitionFunction;
})();
exports.TransitionFunction = TransitionFunction;
var TransitionFunctions = (function (_super) {
    __extends(TransitionFunctions, _super);
    function TransitionFunctions(fsm) {
        _super.call(this);
        this.fsm = fsm;
    }
    TransitionFunctions.prototype.on = function (trigger, callback) {
        var _this = this;
        this.forEach(function (t) {
            if (callback)
                _this.fsm.on(t.to, callback);
            _this.fsm.addEvent(trigger, t.from, t.to);
        });
    };
    return TransitionFunctions;
})(Array);
exports.TransitionFunctions = TransitionFunctions;
var FiniteStateMachine = (function () {
    function FiniteStateMachine(startState) {
        this._transitionFunctions = [];
        this._onCallbacks = {};
        this._exitCallbacks = {};
        this._enterCallbacks = {};
        this._triggers = {};
        this.currentState = startState;
        this._startState = startState;
    }
    FiniteStateMachine.prototype.addTransitions = function (fcn) {
        var _this = this;
        var newTransitions = new TransitionFunctions(this);
        fcn.fromStates.forEach(function (from) {
            fcn.toStates.forEach(function (to) {
                if (from !== to && !_this._validTransition(from, to)) {
                    newTransitions.push(new TransitionFunction(_this, from, to));
                }
            });
        });
        newTransitions.forEach(function (t) { return _this._transitionFunctions.push(t); });
        return newTransitions;
    };
    FiniteStateMachine.prototype.addEvent = function (trigger, fromState, toState) {
        var fr = fromState.toString();
        if (!this._triggers[fr])
            this._triggers[fr] = {};
        this._triggers[fr][trigger.toString()] = toState;
    };
    FiniteStateMachine.prototype.trigger = function (trigger, options) {
        if (typeof trigger === 'undefined')
            return;
        var t = trigger.toString();
        var current = this.currentState.toString();
        if (!this._triggers.hasOwnProperty(current) || !this._triggers[current].hasOwnProperty(t))
            return;
        this.go(this._triggers[current][t], options);
    };
    FiniteStateMachine.prototype.on = function (state, callback) {
        var key = state.toString();
        if (!this._onCallbacks[key]) {
            this._onCallbacks[key] = [];
        }
        this._onCallbacks[key].push(callback);
        return this;
    };
    FiniteStateMachine.prototype.onEnter = function (state, callback) {
        var key = state.toString();
        if (!this._enterCallbacks[key]) {
            this._enterCallbacks[key] = [];
        }
        this._enterCallbacks[key].push(callback);
        return this;
    };
    FiniteStateMachine.prototype.onExit = function (state, callback) {
        var key = state.toString();
        if (!this._exitCallbacks[key]) {
            this._exitCallbacks[key] = [];
        }
        this._exitCallbacks[key].push(callback);
        return this;
    };
    FiniteStateMachine.prototype.from = function () {
        var states = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            states[_i - 0] = arguments[_i];
        }
        var _transition = new Transitions(this);
        _transition.fromStates = states;
        return _transition;
    };
    FiniteStateMachine.prototype.fromAny = function (states) {
        var fromStates = [];
        for (var s in states) {
            if (states.hasOwnProperty(s)) {
                fromStates.push(states[s]);
            }
        }
        var _transition = new Transitions(this);
        _transition.fromStates = fromStates;
        return _transition;
    };
    FiniteStateMachine.prototype._validTransition = function (from, to) {
        return this._transitionFunctions.some(function (tf) {
            return (tf.from === from && tf.to === to);
        });
    };
    FiniteStateMachine.prototype.canGo = function (state) {
        return this.currentState === state || this._validTransition(this.currentState, state);
    };
    FiniteStateMachine.prototype.go = function (state, options) {
        if (!this.canGo(state)) {
            throw new Error('Error no transition function exists from state ' + this.currentState.toString() + ' to ' + state.toString());
        }
        this._transitionTo(state, options);
    };
    FiniteStateMachine.prototype.onTransition = function (from, to, options) {
    };
    FiniteStateMachine.prototype.reset = function () {
        this.currentState = this._startState;
    };
    FiniteStateMachine.prototype._transitionTo = function (state, options) {
        var _this = this;
        if (!this._exitCallbacks[this.currentState.toString()]) {
            this._exitCallbacks[this.currentState.toString()] = [];
        }
        if (!this._enterCallbacks[state.toString()]) {
            this._enterCallbacks[state.toString()] = [];
        }
        if (!this._onCallbacks[state.toString()]) {
            this._onCallbacks[state.toString()] = [];
        }
        var canExit = this._exitCallbacks[this.currentState.toString()].reduce(function (accum, next) {
            return accum && next.call(_this, state, options);
        }, true);
        var canEnter = this._enterCallbacks[state.toString()].reduce(function (accum, next) {
            return accum && next.call(_this, _this.currentState, options);
        }, true);
        if (canExit && canEnter) {
            var old = this.currentState;
            this.currentState = state;
            this._onCallbacks[this.currentState.toString()].forEach(function (fcn) {
                fcn.call(_this, old, state);
            });
            this.onTransition(old, state, options);
        }
    };
    return FiniteStateMachine;
})();
exports.FiniteStateMachine = FiniteStateMachine;
//# sourceMappingURL=typestate.js.map