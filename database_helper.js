'use strict'
const pgp = require('pg-promise')()
// const config = require('./config')

const HOST = 'localhost'
const PORT = '5432'
const DATABASE_NAME = 'chessCompanion'
const username = 'postgres'
const password = 'dirtrider88'

const db = pgp(`postgres://${username}:${password}@${HOST}:${PORT}/${DATABASE_NAME}`)

module.exports = {
  getUser: function(userId) {
    return new Promise((resolve, reject) => {
      db.one('select * from users where userid=$1', userId)
        .then(data => {
          resolve(data)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  updateGame: function(userId, fen) {
    return new Promise((resolve, reject) => {
      db.none('update users set game=$2 where userid=$1', [userId, fen])
        .then(data => {
          resolve(data)
        })
        .catch(err => {
          reject(err)
        })
    })
  }
}
