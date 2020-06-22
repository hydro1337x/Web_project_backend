'use strict'
const ResponseData = require('../Helpers/ResponseData')
const {validate} = use('Validator')

class UpdatePasswordValidator {

  async handle ( ctx, next) {

    const {request, response} = ctx
    const input = request.post()
    const rules = {
      oldPassword: 'required|min:6',
      newPassword: 'required|min:6',
      repeatedNewPassword: 'required|min:6'
    }

    const messages = {
      'oldPassword.required': 'You must provide your old password',
      'oldPassword.min': 'Your old password must be at least 6 characters long',
      'newPassword.required': 'You must provide a new password',
      'newPassword.min': 'Your new password must be at least 6 characters long',
      'repeatedNewPassword.required': 'You must repeat your new password',
      'repeatedNewPassword.min': 'Your repeated password must be at least 6 characters long'
    }

    const validation = await validate(input, rules, messages)

    if (validation.fails()) {
      return response.badRequest(new ResponseData(false, validation.messages()[0].message, null, null))
    }

    if (input.newPassword != input.repeatedNewPassword) {
      return response.badRequest(new ResponseData(false, 'Your new password and repeated password do not match', null, null))
    }

    ctx.passwords = {
      oldPassword: input.oldPassword,
      newPassword: input.newPassword
    }

    await next()
  }
}

module.exports = UpdatePasswordValidator
