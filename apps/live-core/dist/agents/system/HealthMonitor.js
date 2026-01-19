"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthMonitor = void 0;
const events_1 = require("events");
class HealthMonitor extends events_1.EventEmitter {
    constructor(intervalMs = 30000) {
        super();
        this.services = new Map();
        this.checkInterval = null;
        this.intervalMs = 30000;
        this.intervalMs = intervalMs;
    }
    start() {
        if (this.checkInterval)
            return;
        this.checkInterval = setInterval(() => {
            this.checkAllServices();
        }, this.intervalMs);
        console.log('✅ HealthMonitor started');
    }
    stop() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
            console.log('🛑 HealthMonitor stopped');
        }
    }
    registerService(serviceName, checkFn) {
        this.services.set(serviceName, {
            service: serviceName,
            status: 'healthy',
            lastCheck: Date.now()
        });
        this.performCheck(serviceName, checkFn);
    }
    async performCheck(serviceName, checkFn) {
        try {
            const isHealthy = await checkFn();
            const status = {
                service: serviceName,
                status: isHealthy ? 'healthy' : 'down',
                lastCheck: Date.now()
            };
            const previousStatus = this.services.get(serviceName);
            this.services.set(serviceName, status);
            if (previousStatus && previousStatus.status !== status.status) {
                this.emit('status_change', status);
                console.log(`🔄 ${serviceName}: ${previousStatus.status} → ${status.status}`);
            }
        }
        catch (error) {
            const status = {
                service: serviceName,
                status: 'down',
                lastCheck: Date.now(),
                details: error.message
            };
            this.services.set(serviceName, status);
            this.emit('service_down', status);
        }
    }
    checkAllServices() {
        console.log('🏥 Running health checks...');
    }
    getServiceStatus(serviceName) {
        return this.services.get(serviceName);
    }
    getAllStatuses() {
        return Array.from(this.services.values());
    }
    isAllHealthy() {
        return Array.from(this.services.values()).every(s => s.status === 'healthy');
    }
}
exports.HealthMonitor = HealthMonitor;
