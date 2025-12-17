import { VaultClient, VaultClientOptions } from '@js-monorepo/utils/vault'
import { Inject, Injectable, Logger } from '@nestjs/common'

@Injectable()
export class VaultService {
  private readonly logger = new Logger(VaultService.name)
  private readonly vault: VaultClient | null
  private readonly isVaultConfigured: boolean

  constructor(
    @Inject('VAULT_OPTIONS')
    private readonly options: VaultClientOptions
  ) {
    // Only initialize Vault client if endpoint is configured
    this.isVaultConfigured = !!options.endpoint
    this.vault = this.isVaultConfigured ? new VaultClient(options) : null

    if (!this.isVaultConfigured) {
      this.logger.warn('VaultService initialized without endpoint - Vault operations will be disabled')
    }
  }

  async getSecret(path: string, key: string): Promise<string | undefined> {
    if (!this.isVaultConfigured || !this.vault) {
      this.logger.debug('Vault not configured, returning undefined for secret')
      return undefined
    }

    try {
      return await this.vault.getSecret(path, key)
    } catch (error: any) {
      this.logger.warn(`Failed to get secret from Vault: ${path}/${key}`, error.stack)
      return undefined
    }
  }

  async getSecrets(path: string): Promise<Record<string, string | undefined>> {
    if (!this.isVaultConfigured || !this.vault) {
      this.logger.debug('Vault not configured, returning empty secrets object')
      return {}
    }

    try {
      return await this.vault.getSecrets(path)
    } catch (error: any) {
      this.logger.warn(`Failed to get secrets from Vault: ${path}`, error.stack)
      return {}
    }
  }
}
