'use strict'
const User = use('App/Models/User')
const Hash = use('Hash')
const Env = use('Env')
const uuid = require('uuid/v4')
const JWT = require('jsonwebtoken')
const Mail = use('Mail')
const Database =  use('Database')
const ResponseData = require('../../Helpers/ResponseData')


class AuthenticationController {

  async register({userInfo, response}) {

    const {email, password, firstName, lastName} = userInfo

    try {
      var user = await User.create({email, password, firstName, lastName})
    } catch (e) {
      return response.badRequest(new ResponseData(false,'Failed creating user',null, e))
    }

    const emailKey = Env.get('EMAIL_KEY')
    const verificationToken = JWT.sign({"id": user.id}, emailKey, { expiresIn: 15 * 60 }) // JWT Token expires after 15 minutes
    const verificationURL = Env.get('VERIFICATION_URL')
    const resendURL = Env.get('RESEND_VERIFICATION_URL')

    await Mail.send('emails/verification', {verificationUrl: verificationURL + verificationToken, resendUrl: resendURL + user.email}, (message) => {
      message
        .from('web-prog-test@ferit.com')
        .to(user.email)
        .subject('Verify email')
    })

    response.created(new ResponseData(true, 'Successfully created user', user, null))
  }

  async verifyEmail({request, response}) {

    const verificationToken = request.get().token

    if(!verificationToken) {
      return response.badRequest('Invalid JSON token')
    }

    const emailKey = Env.get('EMAIL_KEY')

    try {
      var user = JWT.verify(verificationToken, emailKey)
    } catch (e) {
      return response.badRequest('Invalid JSON token')
    }

    const result = await Database.table('users').where('id', user.id).update('isVerified', true)

    if (!result) {
      return response.badRequest('Database update failed')
    }

    response.ok('Successfully verified email')
  }

  async login({response, loginInput}) {

    try {
      var user = await  User.findByOrFail('email', loginInput.email)
    } catch (e) {
      return response.badRequest(new ResponseData(false, 'Email not found', null, e))
    }

    if (!user.isVerified) {
      return response.badRequest(new ResponseData(false, 'Please verify your email', null, null))
    }

    const passwordValid = await Hash.verify(loginInput.password, user.password)

    if (!passwordValid) {
      return response.badRequest(new ResponseData(false, 'Invalid password', null, null))
    }

    const privateKey = Env.get('APP_KEY')

    const accessToken = JWT.sign({ "id": user.id }, privateKey, { expiresIn: 24 * 60 * 60})


    const data = { accessToken: accessToken}

    response.ok(new ResponseData(true, 'Successfully logged in', data, null))
  }

  async updatePassword({passwords, payload, response}) {

    try {
      var user = await User.findOrFail(payload.id)
    } catch (e) {
      return response.badRequest(new ResponseData(false, 'User not found', null, e))
    }

    const isSame = await Hash.verify(passwords.oldPassword, user.password)

    if (!isSame) {
      return response.badRequest(new ResponseData(false, 'Invalid old password', null, null))
    }

    const newHashedPassword = await Hash.make(passwords.newPassword)
    const result = await Database.table('users').where('id', user.id).update('password', newHashedPassword)

    if (!result) {
      return response.notModified(new ResponseData(false, 'Could not update password', null, null))
    }

    response.ok(new ResponseData(true, 'Successfully updated password', null, null))

  }

  async setNewPassword({newPassword, request, response}) {

    const {accessToken} = request.post()
    const privateKey = Env.get('APP_KEY')

    try {
      var payload = JWT.verify(accessToken, privateKey)
    } catch (e) {
      return response.unauthorized(new ResponseData(false, 'Invalid Access Token', null, e))
    }

    try {
      var user = await User.findOrFail(payload.id)
    } catch (e) {
      return response.badRequest(new ResponseData(false, 'User not found', null, e))
    }

    const newHashedPassword = await Hash.make(newPassword, privateKey)
    const result = await Database.table('users').where('id', user.id).update('password', newHashedPassword)

    if (!result) {
      return response.notModified(new ResponseData(false, 'Could not update password', null, null))
    }

    response.ok(new ResponseData(true, 'Successfully updated password', null, null))

  }

  async forgotPassword({email, response}) {

    try {
      var user = await User.findByOrFail('email', email)
    } catch (error) {
      return response.badRequest(new ResponseData(false, 'Email not registered', null, error))
    }

    const privateKey = Env.get('APP_KEY')

    const accessToken = JWT.sign({'id': user.id}, privateKey, { expiresIn: 15 * 60 })

    const resetPasswordUrl = Env.get('RESET_PASSWORD_URL')

    await Mail.send('emails/reset-password', { url: resetPasswordUrl + accessToken }, (message) => {
      message
        .from('web-project@ferit.hr')
        .to(user.email)
        .subject('Password reset - do not reply')
    })

    response.ok(new ResponseData(true, 'Password reset email successfully sent', null, null))
  }

  async resendEmailVerification({ request, response }) {

    const email = request.get().email

    if (!email) {
      return response.badRequest(new ResponseData(false, 'Invalid email', null, error))
    }

    try {
      var user = await User.findByOrFail('email', email)
    } catch (error) {
      return response.badRequest(new ResponseData(false, 'Email not registered', null, error))
    }

    const emailKey = Env.get('EMAIL_KEY')
    const verificationToken = JWT.sign({"id": user.id}, emailKey, { expiresIn: 15 * 60 }) // JWT Token expires after 15 minutes
    const verificationURL = Env.get('VERIFICATION_URL')
    const resendURL = Env.get('RESEND_VERIFICATION_URL')

    await Mail.send('emails/verification', {verificationUrl: verificationURL + verificationToken, resendUrl: resendURL + user.email}, (message) => {
      message
        .from('web-prog-test@ferit.com')
        .to(user.email)
        .subject('Verify email')
    })

    return response.ok(new ResponseData(true, 'Verification email successfully sent', null, null))
  }

  async getUser({ request, payload, response }) {
    try {
      var user = await User.findOrFail(payload.id)
    } catch (error) {
      return response.badRequest(new ResponseData(false, 'User not found', null, error))
    }

    const data = {user: {id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName}}
    response.ok(new ResponseData(true, 'User successfully fetched', data, null))
  }

  async updateInfo({ request, payload, response }) {

    try {
      var user = await User.findOrFail(payload.id)
    } catch (error) {
      return response.badRequest(new ResponseData(false, 'User not found', null, error))
    }

    const { firstName, lastName } = request.post()

    const result = await Database.table('users').where('id', user.id).update('firstName', firstName).update('lastName', lastName)

    if (!result) {
      return response.notModified(new ResponseData(false, 'Could not update user info', null, null))
    }

    response.ok(new ResponseData(true, 'Successfully updated user info', null, null))

  }

}

module.exports = AuthenticationController
