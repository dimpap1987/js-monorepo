import { LoggedInGuard, SessionUser } from '@js-monorepo/auth/nest/session'
import { IdempotencyInterceptor } from '@js-monorepo/nest/idempotency'
import { SessionUserType } from '@js-monorepo/types/auth'
import { Body, Controller, Get, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common'
import { StartTrialDto } from '../dto/start-trial.dto'
import { TrialService } from '../service/trial.service'

@Controller('payments/trial')
@UseGuards(LoggedInGuard)
export class TrialController {
  constructor(private readonly trialService: TrialService) {}

  @Get('eligibility')
  async checkEligibility(@Query('priceId') priceId: number, @SessionUser() sessionUser: SessionUserType) {
    return this.trialService.checkTrialEligibility(sessionUser.id, priceId)
  }

  @Post('start')
  @UseInterceptors(IdempotencyInterceptor)
  async startTrial(@Body() { priceId }: StartTrialDto, @SessionUser() sessionUser: SessionUserType) {
    return this.trialService.startTrial(sessionUser.id, sessionUser.email, priceId)
  }
}
