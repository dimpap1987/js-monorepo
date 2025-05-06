import Vault from 'node-vault'

export interface VaultClientOptions extends Vault.VaultOptions {
  roleId: string
  secretId: string
  path: string
}

export class VaultClient {
  private vault: ReturnType<typeof Vault>
  private clientToken: string | null = null
  private readonly roleId: string
  private readonly secretId: string

  constructor(private readonly options: VaultClientOptions) {
    this.roleId = options.roleId
    this.secretId = options.secretId

    this.vault = Vault(options)
  }

  private async authenticate(): Promise<void> {
    if (this.clientToken) return
    const result = await this.vault.approleLogin({
      role_id: this.roleId,
      secret_id: this.secretId,
    })

    this.clientToken = result.auth.client_token
    this.vault.token = this.clientToken
  }

  async getSecret(path: string, key: string): Promise<string | undefined> {
    await this.authenticate()

    const result = await this.vault.read(path)
    return result.data.data?.[key]
  }

  async getSecrets(path: string): Promise<Record<string, string | undefined>> {
    await this.authenticate()
    const result = await this.vault.read(path)
    return result.data.data
  }
}
