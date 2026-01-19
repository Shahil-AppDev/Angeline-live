"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBus = void 0;
const events_1 = require("events");
class EventBus extends events_1.EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(50);
    }
    publish(event) {
        this.emit(event.type, event);
        this.emit('*', event);
    }
    subscribe(eventType, handler) {
        this.on(eventType, handler);
    }
    unsubscribe(eventType, handler) {
        this.off(eventType, handler);
    }
    clear() {
        this.removeAllListeners();
    }
}
exports.EventBus = EventBus;
