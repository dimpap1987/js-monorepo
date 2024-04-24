export type RegisterDialogType = {
  formInput: {
    email: string
  }
  userProfileImage?: string
}

export type RegisterDialogErrorComponentType = {
  status: 'untouched' | 'valid' | 'invalid'
  type: 'too_small' | 'too_big' | 'invalid_string' | 'custom'
  message: string
}
