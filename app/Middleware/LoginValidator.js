'use strict'
const ResponseData = require('../Helpers/ResponseData')
const {validate} = use('Validator')

class LoginValidator {

  async handle (ctx, next) {

  const {request, response} = ctx

    const user = request.post()

    const loginInput  = { 'email': user.email, 'password': user.password }

    const rules = {
      email: 'required|email',
      password: 'required|min:6'
    }

    const messages = {
      'email.required': 'You must provide an email address.',
      'email.email': 'You must provide a valid email adress',
      'password.required': 'You must provide a password',
      'password.min': 'Invalid password'
    }

    const validation = await validate(loginInput, rules, messages)

    if (validation.fails()) {
      return response.badRequest(new ResponseData(false, validation.messages()[0].message, false, false))
    }

    ctx.loginInput = loginInput

    await next()
  }
}

module.exports = LoginValidator
