import { Module } from '@nestjs/common'
import { FeatureFlagsService } from './feature-flags.service'

@Module({
  imports: [],
  // CacheModule is registered globally in app.module.ts with isGlobal: true
  // No need to import it here - it's available everywhere
  providers: [FeatureFlagsService],
  exports: [FeatureFlagsService],
})
export class FeatureFlagsModule {}
