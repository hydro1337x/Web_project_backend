'use strict'
const ResponseData = require('../Helpers/ResponseData')
const JWT = require('jsonwebtoken')
const Env = use('Env')

class Authenticator {

  async handle (ctx, next) {

    const { request, response } = ctx
    const token = request.header('Authorization')

    if (!token) {
      response.unauthorized(new ResponseData(false, 'Access Denied', null, null))
    }

    const privateKey = Env.get('APP_KEY')

    try {
      var verified = JWT.verify(token, privateKey)
    } catch (e) {
      return response.unauthorized(new ResponseData(false, 'Invalid Access Token', null, e))
    }

    ctx.payload = verified // Contains the ID used to sign the JWT Token

    await next()
  }
}

module.exports = Authenticator
