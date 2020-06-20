'use strict'

const ResponseData = require('../Helpers/ResponseData')
const {validate} = use('Validator')

class EmailValidator {

  async handle (ctx, next) {

    const { response, request } = ctx

    const {email} = request.post()

    const rules = { email: 'required|email'}

    const messages = {
      'email.required': 'You must provide an email address',
      'email.email': 'Email address must be valid'
    }

    const validation = await validate(email, rules, messages)

    if (validation.fails()) {
      return response.badRequest(new ResponseData(false, validation.messages()[0].message, null, null))
    }

    ctx.email = email

    await next()
  }
}

module.exports = EmailValidator
