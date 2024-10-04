import { ConfigurableModuleBuilder } from '@nestjs/common'

export class RedisEventPubSubModuleOptions {
  readonly url: string

  constructor(url: string) {
    this.url = url
  }
}

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<RedisEventPubSubModuleOptions>()
    .setExtras(
      {
        isGlobal: true,
      },
      (definition, extras) => ({
        ...definition,
        global: extras.isGlobal,
      })
    )
    .build()
