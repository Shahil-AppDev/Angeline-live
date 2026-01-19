import { HealthStatus } from '@angeline-live/shared';
import { EventEmitter } from 'events';

export class HealthMonitor extends EventEmitter {
  private services: Map<string, HealthStatus> = new Map();
  private checkInterval: NodeJS.Timeout | null = null;
  private intervalMs: number = 30000;

  constructor(intervalMs: number = 30000) {
    super();
    this.intervalMs = intervalMs;
  }

  start(): void {
    if (this.checkInterval) return;

    this.checkInterval = setInterval(() => {
      this.checkAllServices();
    }, this.intervalMs);

    console.log('✅ HealthMonitor started');
  }

  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log('🛑 HealthMonitor stopped');
    }
  }

  registerService(serviceName: string, checkFn: () => Promise<boolean>): void {
    this.services.set(serviceName, {
      service: serviceName,
      status: 'healthy',
      lastCheck: Date.now()
    });

    this.performCheck(serviceName, checkFn);
  }

  private async performCheck(serviceName: string, checkFn: () => Promise<boolean>): Promise<void> {
    try {
      const isHealthy = await checkFn();
      
      const status: HealthStatus = {
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
    } catch (error: any) {
      const status: HealthStatus = {
        service: serviceName,
        status: 'down',
        lastCheck: Date.now(),
        details: error.message
      };

      this.services.set(serviceName, status);
      this.emit('service_down', status);
    }
  }

  private checkAllServices(): void {
    console.log('🏥 Running health checks...');
  }

  getServiceStatus(serviceName: string): HealthStatus | undefined {
    return this.services.get(serviceName);
  }

  getAllStatuses(): HealthStatus[] {
    return Array.from(this.services.values());
  }

  isAllHealthy(): boolean {
    return Array.from(this.services.values()).every(s => s.status === 'healthy');
  }
}
