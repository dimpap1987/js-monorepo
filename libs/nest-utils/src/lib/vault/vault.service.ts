import { VaultClient, VaultClientOptions } from '@js-monorepo/utils/vault'
import { Inject, Injectable } from '@nestjs/common'

@Injectable()
export class VaultService {
  private readonly vault: VaultClient

  constructor(
    @Inject('VAULT_OPTIONS')
    private readonly options: VaultClientOptions
  ) {
    this.vault = new VaultClient(options)
  }

  async getSecret(path: string, key: string): Promise<string | undefined> {
    return this.vault.getSecret(path, key)
  }

  async getSecrets(path: string): Promise<Record<string, string | undefined>> {
    return this.vault.getSecrets(path)
  }
}
