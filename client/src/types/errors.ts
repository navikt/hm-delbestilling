export class ApiError extends Error {
  statusCode: number | undefined

  constructor(message: string, statusCode?: number) {
    super(message)
    this.statusCode = statusCode
  }

  isUnauthorized(): boolean {
    return this.statusCode === 401
  }

  isForbidden(): boolean {
    return this.statusCode === 403
  }
}
