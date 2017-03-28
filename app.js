const express = require('express')
const http = require('http')
const app = module.exports.app = express()


const Chess = require('chess.js').Chess
const db = require('./database_helper')

const server = http.createServer(app);
const io = require('socket.io').listen(server)

let config
try {
  config = require('../firetv_chess_config.json')
} catch(e) {
  console.log('Cant find config file. using env variables')
  config = process.env
}

const PORT = config['port']

io.on('connection', function(client){
  client.on('disconnect', function(){
    console.log(`Client disconnected`)
  })
});

app.use(express.static('public'))
app.set('view engine', 'ejs')

app.get('/', function (req, res) {
  res.render('index')
})

app.get('/api/move', function(req, res) {
  let from = req.query['from']
  let to = req.query['to']
  let userId = req.query['userId']
  db.getUser(userId)
      .then(user => {
        if (!user) {
          return res.send(JSON.stringify({'error': 'Invalid userId'}))
        }
        let game = null
        if (user.game) {
          game = new Chess(user.game)
        } else {
          game = new Chess()
        }
        let move
        if (!to) {
          move = game.move(from)
        } else {
          move = game.move({from: from, to: to})
        }
        if (move) {
          io.emit(userId, {from: move.from, turn: game.turn(), to: move.to, userId: userId})

          let aiMove
          if (user.players === '1') {
            let moves = game.moves()
            aiMove = moves[Math.floor(Math.random() * moves.length)]
            aiMove = game.move(aiMove)
            io.emit(userId, {from: aiMove.from, turn: game.turn(), to: aiMove.to, userId: userId})
          }

          db.updateGame(userId, game.fen())
          let resData = {
            userId: userId,
            turn: game.turn(),
            move: {
              from: move.from,
              to: move.to,
              color: move.color
            }
          }
          if (aiMove) {
            resData.aiMove = {
              from: aiMove.from,
              to: aiMove.to,
              color: aiMove.color
            }
          }
          res.send(JSON.stringify(resData))
        } else {
          res.send(JSON.stringify({'error': 'Invalid Move', userId: userId}))
        }
      })
      .catch(err => {
        console.log(err)
        res.send(JSON.stringify({'error': 'There was an error connecting to database'}))
      })
})

app.get('/api/fen', function(req, res) {
  let userId = req.query['userId']
  db.getUser(userId)
      .then(user => {
        if (!user) {
          return res.send(JSON.stringify({'error': 'Invalid userId'}))
        }
        let game = new Chess(user.game)
        res.send(JSON.stringify({fen: user.game, turn: game.turn()}))
      })
      .catch(err => {
        console.log('err:', err)
        res.send(JSON.stringify({'error': 'There was an error connecting to database'}))
      })
})

/**
 * Creates new game
 * can only have one game
 * query params:
 *  - userId  -> echo userId
 *  - color   -> white | black
 *  - players -> 1 | 2
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return [type]       [description]
 */
app.get('/api/new_game', function(req, res) {
  let userId = req.query['userId']
  let color = req.query['color']
  let players = req.query['players']
  db.getUser(userId)
      .then(user => {
        if (!user) {
          return res.send(JSON.stringify({'error': 'Invalid userId'}))
        }
        let game = new Chess()

        db.newGame(userId, game.fen(), color, players)
          .then(data => {
            io.emit(userId, {newGame: 'true', turn: game.turn()})
            // have ai start as white
            if (color === 'black' && (players === undefined || players === '1')) {
              let moves = game.moves()
              let move = moves[Math.floor(Math.random() * moves.length)]
              move = game.move(move)
              io.emit(userId, {from: move.from, turn: game.turn(), to: move.to, userId: userId})
              let resData = {
                userId: userId,
                turn: game.turn(),
                aiMove: {
                  from: move.from,
                  to: move.to
                }
              }
              res.send(JSON.stringify(resData))
              db.updateGame(userId, game.fen())
            } else {
              res.send(JSON.stringify({'message': 'Successfully created a new game'}))
            }
          })
          .catch(err => {
            res.send(JSON.stringify({'error': 'There was a problem creating a new game'}))
          })
      })
      .catch(err => {
        console.log('err:', err)
        res.send(JSON.stringify({'error': 'There was an error connecting to database'}))
      })
})

/**
 * Resets the game to default fen state. Keeps players and color state.
 * @return [type] [description]
 */
app.get('/api/reset', function(req, res) {
  let userId = req.query['userId']
  let game = new Chess()
  let resData = {}
  db.getUser(userId)
    .then(user => {
      io.emit(userId, {newGame: 'true', turn: game.turn()})
      let color = user.color
      let players = user.players
      if (color === 'black' && (players === undefined || players === '1')) {
        let moves = game.moves()
        let move = moves[Math.floor(Math.random() * moves.length)]
        move = game.move(move)
        io.emit(userId, {from: move.from, turn: game.turn(), to: move.to, userId: userId})
        resData = {
          userId: userId,
          turn: game.turn(),
          aiMove: {
            from: move.from,
            to: move.to
          }
        }
      }
      resData.message = 'Successfully reset game'
      res.send(JSON.stringify(resData))
      db.updateGame(userId, game.fen())
    })
    .catch(err => {
      console.log('err:', err)
    })
})

server.listen(PORT)
