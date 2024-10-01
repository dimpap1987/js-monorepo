export class ConstraintViolationException extends Error {
  code?: ConstraintCode

  constructor(code?: ConstraintCode) {
    super()
    this.code = code
  }
}

export enum ConstraintCode {
  USERNAME_EXISTS,
  PROFILE_EXISTS,
}
