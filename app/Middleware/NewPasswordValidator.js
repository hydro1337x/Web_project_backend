'use strict'
const {validate} = use('Validator')
const ResponseData = require('../Helpers/ResponseData')

class NewPasswordValidator {

  async handle (ctx, next) {

    const {request, response} = ctx
    const input = request.post()
    const rules = {
      newPassword: 'required|min:6',
      repeatedNewPassword: 'required|min:6'
    }

    const messages = {
      'newPassword.required': 'You must provide a new password',
      'newPassword.min': 'Your new password must be at least 6 characters long',
      'repeatedNewPassword.required': 'You must repeat your new password',
      'repeatedNewPassword.min': 'Your new password must be at least 6 characters long'
    }

    const validation = await validate(input, rules, messages)

    if (validation.fails()) {
      return response.badRequest(new ResponseData(false, validation.messages()[0].message), null, null)
    }

    if (input.newPassword != input.repeatedNewPassword) {
      return response.badRequest(new ResponseData(false, 'Passwords do not match', null, null))
    }

    ctx.newPassword = input.newPassword

    await next()
  }
}

module.exports = NewPasswordValidator
