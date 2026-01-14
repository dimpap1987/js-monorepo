import { ProviderName, UserStatus } from '@js-monorepo/types/auth'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { AuthService } from '../services/interfaces/auth.service'
import { UnregisteredService } from '../services/interfaces/unregistered-user.service'
import { UserProfileService } from '../services/interfaces/user-profile.service'
import { ServiceAuth, ServiceUnRegisteredUser, ServiceUserProfile, SessionConfiguration } from '../types'
import { generateUniqueUsername, normalizeDisplayName } from '../utils'

export interface OAuthProfileData {
  email: string
  displayName: string
  profileImage?: string | null
  firstName?: string | null
  lastName?: string | null
  accessToken?: string
  refreshToken?: string
  scopes?: string[]
}

@Injectable()
export class OAuthHandler {
  private readonly logger = new Logger(OAuthHandler.name)

  constructor(
    @Inject(ServiceAuth) private readonly authService: AuthService,
    @Inject(ServiceUnRegisteredUser) private readonly unRegisteredUserService: UnregisteredService,
    @Inject(ServiceUserProfile) private readonly userProfileService: UserProfileService
  ) {}

  async handleOAuthCallback(
    profileData: OAuthProfileData,
    providerName: ProviderName,
    options: SessionConfiguration,
    done: (error: any, user?: any) => void
  ): Promise<void> {
    const { email } = profileData

    try {
      const existingUser = await this.authService.findAuthUserByEmail(email)

      if (existingUser) {
        return await this.handleExistingUser(existingUser, profileData, providerName, done)
      }

      if (options.skipOnboarding) {
        return await this.handleAutoRegistration(profileData, providerName, done)
      }

      return await this.handleUnregisteredUser(profileData, providerName, done)
    } catch (error: any) {
      this.logger.error(`OAuth callback failed for ${providerName}`, error.stack)
      done(error, undefined)
    }
  }

  private async handleExistingUser(
    user: any,
    profileData: OAuthProfileData,
    providerName: ProviderName,
    done: (error: any, user?: any) => void
  ): Promise<void> {
    // Check if user is active (not banned or deactivated)
    if (user.status !== UserStatus.ACTIVE) {
      const statusMessage = user.status === UserStatus.BANNED ? 'banned' : 'deactivated'
      this.logger.warn(`Login attempt by ${statusMessage} user: ${user.id} (${user.email})`)
      return done(new Error(`ACCOUNT_${user.status}`), undefined)
    }

    // Account linking: upsert profile for this provider (creates if new, updates if exists)
    await this.userProfileService.upsertUserProfile(user.id, providerName, {
      profileImage: profileData.profileImage,
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      accessToken: profileData.accessToken,
      refreshToken: profileData.refreshToken,
      scopes: profileData.scopes,
    })

    this.logger.debug(`Linked/updated ${providerName} profile for user ${user.id}`)

    const sessionUser = this.authService.createSessionUser(user)
    done(null, { user: sessionUser })
  }

  private async handleAutoRegistration(
    profileData: OAuthProfileData,
    providerName: ProviderName,
    done: (error: any, user?: any) => void
  ): Promise<void> {
    const { email, displayName, profileImage, firstName, lastName, accessToken, refreshToken, scopes } = profileData

    const normalizedName = normalizeDisplayName(displayName)
    const username = await generateUniqueUsername(normalizedName, async (candidate) => {
      const existing = await this.authService.findAuthUserByUsername(candidate)
      return existing !== null
    })

    const newUser = await this.authService.createAuthUserByProviderName(
      { email, username },
      providerName,
      profileImage,
      undefined,
      { firstName, lastName, accessToken, refreshToken, scopes }
    )

    const sessionUser = this.authService.createSessionUser(newUser)
    done(null, { user: sessionUser })
  }

  private async handleUnregisteredUser(
    profileData: OAuthProfileData,
    providerName: ProviderName,
    done: (error: any, user?: any) => void
  ): Promise<void> {
    const unRegisteredUser = await this.unRegisteredUserService.createUnRegisteredUser({
      email: profileData.email,
      provider: providerName,
      profileImage: profileData.profileImage,
    })

    done(null, { unRegisteredUser })
  }
}

export function extractDisplayNameFromEmail(email: string): string {
  return email?.split('@')[0] || 'user'
}
