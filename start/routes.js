'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.get('/api/', () => {
  return { greeting: 'Hello world in JSON' }
})

/** AuthenticationController */

Route.post('/api/auth/register', 'AuthenticationController.register').middleware('registrationValidator')
Route.get('/api/auth/verification', 'AuthenticationController.verifyEmail')
Route.post('/api/auth/login', 'AuthenticationController.login').middleware('loginValidator')
Route.patch('api/auth/password/new', 'AuthenticationController.setNewPassword').middleware('newPasswordValidator')
Route.post('api/auth/password/forgot', 'AuthenticationController.forgotPassword').middleware('emailValidator')
Route.get('api/auth/verification/resend', 'AuthenticationController.resendEmailVerification')
Route.get('api/auth/user', 'AuthenticationController.getUser').middleware('authenticator')
Route.patch('/api/auth/user/password/update', 'AuthenticationController.updatePassword').middleware('updatePasswordValidator').middleware('authenticator')
Route.patch('/api/auth/user/info/update', 'AuthenticationController.updateInfo').middleware('authenticator')

/** PostController */

Route.post('/api/post/create', 'PostController.create').middleware('authenticator')
Route.patch('/api/post/edit', 'PostController.edit').middleware('authenticator')
Route.delete('/api/post/delete', 'PostController.delete').middleware('authenticator')
Route.get('/api/post/get', 'PostController.get')

