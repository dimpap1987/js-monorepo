import { ProviderName } from '@js-monorepo/types/auth'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { AuthService } from '../services/interfaces/auth.service'
import { UnregisteredService } from '../services/interfaces/unregistered-user.service'
import { ServiceAuth, ServiceUnRegisteredUser, SessionConfiguration } from '../types'
import { generateUniqueUsername, normalizeDisplayName } from '../utils'

export interface OAuthProfileData {
  email: string
  displayName: string
  profileImage?: string | null
}

@Injectable()
export class OAuthHandler {
  private readonly logger = new Logger(OAuthHandler.name)

  constructor(
    @Inject(ServiceAuth) private readonly authService: AuthService,
    @Inject(ServiceUnRegisteredUser) private readonly unRegisteredUserService: UnregisteredService
  ) {}

  async handleOAuthCallback(
    profileData: OAuthProfileData,
    providerName: ProviderName,
    options: SessionConfiguration,
    done: (error: any, user?: any) => void
  ): Promise<void> {
    const { email, displayName, profileImage } = profileData

    try {
      const existingUser = await this.authService.findAuthUserByEmail(email)

      if (existingUser) {
        return this.handleExistingUser(existingUser, done)
      }

      if (options.skipOnboarding) {
        return await this.handleAutoRegistration(email, displayName, profileImage, providerName, done)
      }

      return await this.handleUnregisteredUser(email, profileImage, providerName, done)
    } catch (error: any) {
      this.logger.error(`OAuth callback failed for ${providerName}`, error.stack)
      done(error, undefined)
    }
  }

  private handleExistingUser(user: any, done: (error: any, user?: any) => void): void {
    const sessionUser = this.authService.createSessionUser(user)
    done(null, { user: sessionUser })
  }

  private async handleAutoRegistration(
    email: string,
    displayName: string,
    profileImage: string | null | undefined,
    providerName: ProviderName,
    done: (error: any, user?: any) => void
  ): Promise<void> {
    const normalizedName = normalizeDisplayName(displayName)
    const username = await generateUniqueUsername(normalizedName, async (candidate) => {
      const existing = await this.authService.findAuthUserByUsername(candidate)
      return existing !== null
    })

    const newUser = await this.authService.createAuthUserByProviderName({ email, username }, providerName, profileImage)

    const sessionUser = this.authService.createSessionUser(newUser)
    done(null, { user: sessionUser })
  }

  private async handleUnregisteredUser(
    email: string,
    profileImage: string | null | undefined,
    providerName: ProviderName,
    done: (error: any, user?: any) => void
  ): Promise<void> {
    const unRegisteredUser = await this.unRegisteredUserService.createUnRegisteredUser({
      email,
      provider: providerName,
      profileImage,
    })

    done(null, { unRegisteredUser })
  }
}

export function extractDisplayNameFromEmail(email: string): string {
  return email?.split('@')[0] || 'user'
}
