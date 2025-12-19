import { Controller, Logger } from '@nestjs/common'
import { MessagePattern, EventPattern } from '@nestjs/microservices'

@Controller()
export class HealthController {
  private readonly logger = new Logger(HealthController.name)

  @MessagePattern({ cmd: 'health' })
  getHealth() {
    return {
      status: 'ok',
      service: 'workers',
      timestamp: new Date().toISOString(),
    }
  }

  @MessagePattern({ cmd: 'ping' })
  ping() {
    this.logger.debug('Ping received')
    return { pong: true, timestamp: new Date().toISOString() }
  }

  @EventPattern('workers.health.check')
  handleHealthCheckEvent(data: any) {
    this.logger.debug('Health check event received', data)
  }
}
