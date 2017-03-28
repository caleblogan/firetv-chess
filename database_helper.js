'use strict'
const pgp = require('pg-promise')()

let config
try {
  config = require('../firetv_chess_config.json')
} catch(e) {
  console.log('Cant find config file. using env variables')
  config = process.env
}

const HOST = config['database']['host']
const PORT = config['database']['port']
const DATABASE_NAME = config['database']['name']
const username = config['database']['username']
const password = config['database']['password']

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
  },
  newGame: function(userId, fen, color, players) {
    if (!color) {
      color = 'white'
    }
    if (!players) {
      players = '1'
    }
    return new Promise((resolve, reject) => {
      db.none('update users set game=$2, color=$3, players=$4 where userid=$1',
              [userId, fen, color, players])
        .then(data => {
          resolve(data)
        })
        .catch(err => {
          reject(err)
        })
    })
  }
}
