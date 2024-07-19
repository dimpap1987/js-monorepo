export class ConstraintViolationException extends Error {
  code?: CONSTRAINT_CODE

  constructor(code?: CONSTRAINT_CODE) {
    super()
    this.code = code
  }
}

export enum CONSTRAINT_CODE {
  USERNAME_EXISTS,
}
