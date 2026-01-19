"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogLevel = exports.IntentAxis = exports.IntentLevel = void 0;
var IntentLevel;
(function (IntentLevel) {
    IntentLevel["H0"] = "H0";
    IntentLevel["H1"] = "H1";
    IntentLevel["H2"] = "H2";
    IntentLevel["H3"] = "H3";
})(IntentLevel || (exports.IntentLevel = IntentLevel = {}));
var IntentAxis;
(function (IntentAxis) {
    IntentAxis["SENTIMENTAL"] = "SENTIMENTAL";
    IntentAxis["TRAVAIL"] = "TRAVAIL";
    IntentAxis["FAMILLE"] = "FAMILLE";
    IntentAxis["SPIRITUEL"] = "SPIRITUEL";
})(IntentAxis || (exports.IntentAxis = IntentAxis = {}));
var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "DEBUG";
    LogLevel["INFO"] = "INFO";
    LogLevel["WARN"] = "WARN";
    LogLevel["ERROR"] = "ERROR";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
