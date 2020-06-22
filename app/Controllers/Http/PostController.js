'use strict'

const ResponseData = use('App/Helpers/ResponseData')
const User = use('App/Models/User')
const Post = use('App/Models/Post')
const Database = use('Database')

/**
 * Resourceful controller for interacting with posts
 */
class PostController {

  async create ({ request, payload, response }) {

    try {
      var user = await User.findOrFail(payload.id)
    } catch (error) {
      return response.badRequest(new ResponseData(false, 'User not found', null, error))
    }

    const { title, description } = request.post()

    const user_id = user.id

    try {
      var post = await Post.create({ title, description, user_id })
    } catch (error) {
      return response.badRequest(new ResponseData(false, 'Failed to create post', null, error))
    }

    return response.ok(new ResponseData(true, 'Post created successfully', post, null))
  }


  async edit ({ request, payload, response}) {

    try {
      var user = await User.findOrFail(payload.id)
    } catch (error) {
      return response.badRequest(new ResponseData(false, 'User not found', null, error))
    }

    let { id, title, description } = request.post()

    try {
      var post = await Post.findOrFail(id)
    } catch (error) {
      return response.badRequest(new ResponseData(false, 'Post not found', null, error))
    }

    try {
      var result = await Post.query()
        .where('user_id', user.id)
        .where('id', post.id)
        .update({ title: title, description: description })
    } catch (error) {
      return response.badRequest(new ResponseData(false, 'Query failed', null, null))
    }

    if (!result) {
      return response.badRequest(new ResponseData(false, 'Could not update post', null, null))
    }

    return response.ok(new ResponseData(true, 'Post edited successfully', null, null))

  }

  async delete ({ request, payload, response }) {

    try {
      var user = await User.findOrFail(payload.id)
    } catch (error) {
      return response.badRequest(new ResponseData(false, 'User not found', null, error))
    }

    const { id } = request.post()

    try {
      var result = await Post.query()
        .where('user_id', user.id)
        .where('id', id)
        .delete()
    } catch (error) {
      return response.badRequest(new ResponseData(false, 'Query failed', null, error))
    }

    if (!result) {
      return result
      return response.badRequest(new ResponseData(false, 'Could not delete post', null, null))
    }

    return response.ok(new ResponseData(true, 'Post deleted successfully', null, null))
  }

  async get({ request, response }) {

    const id = request.get().id

    if (!id) {
      try {
        let posts = await Post.query().fetch()
        return response.ok(new ResponseData(true, 'Successfully fetched posts', posts, null))
      } catch (error) {
        return response.badRequest(new ResponseData(false, 'Could not fetch posts', null, error))
      }
    }

    try {
      var post = await Post.findOrFail(id)
      return response.ok(new ResponseData(true, 'Successfully fetched post', post, null))
    } catch (error) {
      return response.badRequest(new ResponseData(false, 'Could not fetch post', null, error))
    }

  }

}

module.exports = PostController
