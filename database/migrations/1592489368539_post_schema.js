'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PostSchema extends Schema {
  up () {
    this.create('posts', (table) => {
      table.increments()
      table.string('title', 255)
      table.text('description')
      table.integer('user_id').unsigned()
      table.foreign('user_id').references('users.id').onDelete('cascade')
      table.timestamps()
    })
  }

  down () {
    this.drop('posts')
  }
}

module.exports = PostSchema
