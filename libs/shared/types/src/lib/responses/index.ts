export type SuccessResponse<T = any> = {
  ok: true
  data?: T
  message?: string
  status: number
}

export type ErrorResponse = {
  ok: false
  message?: string
  errors?: string[]
  status: number
}

export type ClientResponseType<T = any> = SuccessResponse<T> | ErrorResponse
