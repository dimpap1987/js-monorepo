// import { JwtTokenService } from '@mymonorepo/jwt-utils'
// import { Injectable, Logger, NestMiddleware } from '@nestjs/common'

// @Injectable()
// export class LoggerMiddleware implements NestMiddleware {
//   constructor(private jwtService: JwtTokenService) {}

//   use(req, res, next) {
//     const { ip, method, path: url } = req
//     const email = this.jwtService.extractPayload(req.cookies['accessToken'])?.user?.email
//     const userAgent = req.get('user-agent') || ''

//     res.on('close', () => {
//       const { statusCode } = res
//       const contentLength = res.get('content-length')
//       const emailLog = `${email ? `- email: ${email}` : ''}`

//       Logger.log(`${method} ${url} ${statusCode} ${contentLength} - ${userAgent} ${ip} ${emailLog}`)
//     })
//     next()
//   }
// }
