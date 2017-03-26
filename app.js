var express = require('express')
var http = require('http')
var app = module.exports.app = express()

const Chess = require('chess.js').Chess

var server = http.createServer(app);
var io = require('socket.io').listen(server)

io.on('connection', function(client){
  client.on('disconnect', function(){
    console.log(`Client disconnected`)
  })
});

const db = require('./database_helper')

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
          console.log(game.fen())
        } else {
          game = new Chess()
        }
        let move = game.move({from: from, to: to})
        if (move) {
          io.emit(userId, {from: from, to: to, userId: userId})
          console.log('moving before')
          res.send(JSON.stringify({'move': from + '-' + to, userId: userId}))
          db.updateGame(userId, game.fen())
          console.log('moving after')
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
        res.send(JSON.stringify({fen: user.game}))
      })
      .catch(err => {
        console.log('err:', err)
        res.send(JSON.stringify({'error': 'There was an error connecting to database'}))
      })
})

app.get('/api/new_game', function(req, res) {
  let userId = req.query['userId']
  db.getUser(userId)
      .then(user => {
        if (!user) {
          return res.send(JSON.stringify({'error': 'Invalid userId'}))
        }
        let game = new Chess()
        db.updateGame(userId, game.fen())
          .then(data => {
            res.send(JSON.stringify({'message': 'Successfully created a new game'}))
            io.emit(userId, {newGame: 'true'})
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


server.listen(3000)
