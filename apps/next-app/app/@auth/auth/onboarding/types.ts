export type RegisterDialogType = {
  formInput: {
    email: string
  }
}

export type RegisterDialogErrorComponentType = {
  status: 'untouched' | 'valid' | 'invalid'
  type: 'too_small' | 'too_big' | 'custom'
  message: string
}
