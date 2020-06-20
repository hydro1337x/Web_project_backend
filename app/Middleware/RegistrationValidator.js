'use strict'
const ResponseData = require('../Helpers/ResponseData')
const {validate} = use('Validator')

class RegistrationValidator {

  async handle (ctx, next) {

    const {request, response} = ctx
    const userInfo = request.post()

    const rules = {
      email: 'required|email|unique:users,email',
      password: 'required|min:6',
      repeatedPassword: 'required|min:6'
    }

    const messages = {
      'email.required': 'You must provide an email adress',
      'email.unique': 'This email is already registered',
      'password.required': 'You must provide a password',
      'password.min': 'Your password must be at lest 6 characters long',
      'repeatedPassword.required': 'You must repeat your password',
      'repeatedPassword.min': 'Your repeated password must be at lest 6 characters long'
    }

    const validation = await validate(userInfo, rules, messages)

    if (validation.fails()) {
      return response.badRequest(new ResponseData(false, validation.messages()[0].message, null, null))
    }

    const { password, repeatedPassword } = userInfo

    if (password != repeatedPassword) {
      return response.badRequest(new ResponseData(false, 'Password do not match', null, null))
    }

    ctx.userInfo = userInfo

    await next()
  }
}

module.exports = RegistrationValidator
