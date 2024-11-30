import { EditUserDto } from '@js-monorepo/types'
import { API } from '@next-app/utils/api-proxy'

export async function apiUserUpdate(payload: EditUserDto) {
  return API.url(`${process.env.NEXT_PUBLIC_AUTH_URL}/api/users`)
    .patch()
    .body(payload)
    .withCredentials()
    .withCsrf()
    .execute()
}
