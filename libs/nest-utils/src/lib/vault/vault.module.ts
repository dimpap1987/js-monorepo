import { VaultClient, VaultClientOptions } from '@js-monorepo/utils/vault'
import { DynamicModule, Global, Logger, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { VaultService } from './vault.service'

@Global()
@Module({})
export class VaultModule {
  private static readonly logger = new Logger(VaultModule.name)

  static register(options: VaultClientOptions): DynamicModule {
    return {
      module: VaultModule,
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: [`.env.${process.env['NODE_ENV']}`, '.env'], // Load .env files
          load: [async () => this.loadVaultSecrets(options)], // Load Vault secrets
        }),
      ],
      providers: [
        {
          provide: 'VAULT_OPTIONS',
          useValue: options,
        },
        VaultService,
      ],
      exports: [VaultService],
    }
  }

  private static async loadVaultSecrets(options: VaultClientOptions) {
    const { path } = options

    try {
      // Fetch secrets from Vault
      const vaultService = new VaultClient(options)
      const secrets = await vaultService.getSecrets(path)

      if (!secrets || Object.keys(secrets).length === 0) {
        this.logger.warn(`No secrets found at path: ${path}`)
        return process.env
      }

      const config: Record<string, string | undefined> = {}

      for (const [key, value] of Object.entries(secrets)) {
        config[key] = value ?? process.env[key]
      }
      this.logger.log(`Vault secrets successfully loaded from path: ${path} 👌`)

      // Return the merged configuration, where Vault secrets take priority over process.env
      return { ...process.env, ...config }
    } catch (error: any) {
      this.logger.error(`Failed to load secrets from Vault at path: ${path}`, error.stack)
      throw new Error(`Vault loading error: ${error.message}`)
    }
  }
}
