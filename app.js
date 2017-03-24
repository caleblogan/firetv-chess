var express = require('express')
var http = require('http')
var app = module.exports.app = express()

var server = http.createServer(app);
var io = require('socket.io').listen(server)

io.on('connection', function(client){
  // client.emit('light', {lightStatus: 'off'})
  client.on('light', function(data){
    let userId = 'amzn1.ask.account.AGV53DZTOOAIBHLOZQ6RBPZ4ERLC2N2CAABQ424T5NNACE3DJFX6OZMZOZNXAKLKVKAUH5R4UBB2GF3GQURHIMKTJRPK2FYDQTIDFB4J2M23FKZQINRIGAJP7675EU6EWZMBY7K6LFZJMI4N5ZXXWZMDPWMAEIKUW5USWLSIJ7EK4ND6F7GXSOGYIGPLQMTCXHACHZME7EV2BJQ'
    users.find(userId)
        .then(user => {
          if (user) {
            data.lightStatus = user.lightStatus
          }
          client.emit('light', data)
        })
        .catch(err => {
          console.log(err)
          data.lightStatus = 'err'
          data.error = err
          client.emit('light', data)
        })
  })
  client.on('disconnect', function(){
    console.log(`Client disconnected`)
  })
});

const config = require('./config')
let credentials = {
    accessKeyId: config['accessKeyId'],
    secretAccessKey: config['secretAccessKey'],
    region: 'us-east-1'
}
const dynasty = require('dynasty')(credentials);
let users = dynasty.table('alexaChessCompanionData')

app.use(express.static('public'))
app.set('view engine', 'ejs')

app.get('/', function (req, res) {
  res.render('index', {message: 'This is my message'})
})

app.get('/light_status', function(req, res) {
  res.render('lights', {message: 'message text stuff', lightStatus: ''})
})

app.get('/api/light_status', function(req, res) {
  let data = {lightStatus: 'on'}
  let userId = 'amzn1.ask.account.AGV53DZTOOAIBHLOZQ6RBPZ4ERLC2N2CAABQ424T5NNACE3DJFX6OZMZOZNXAKLKVKAUH5R4UBB2GF3GQURHIMKTJRPK2FYDQTIDFB4J2M23FKZQINRIGAJP7675EU6EWZMBY7K6LFZJMI4N5ZXXWZMDPWMAEIKUW5USWLSIJ7EK4ND6F7GXSOGYIGPLQMTCXHACHZME7EV2BJQ'
  users.find(userId)
      .then(user => {
        if (user) {
          data.lightStatus = user.lightStatus
        }
        res.send(JSON.stringify(data))
      })
      .catch(err => {
        console.log(err)
        data.lightStatus = 'err'
        data.error = err
        res.send(JSON.stringify(data))
      })
})

app.get('/api/light_was_updated', function(req, res) {
  let data = {lightStatus: 'on'}
  let userId = 'amzn1.ask.account.AGV53DZTOOAIBHLOZQ6RBPZ4ERLC2N2CAABQ424T5NNACE3DJFX6OZMZOZNXAKLKVKAUH5R4UBB2GF3GQURHIMKTJRPK2FYDQTIDFB4J2M23FKZQINRIGAJP7675EU6EWZMBY7K6LFZJMI4N5ZXXWZMDPWMAEIKUW5USWLSIJ7EK4ND6F7GXSOGYIGPLQMTCXHACHZME7EV2BJQ'
  users.find(userId)
      .then(user => {
        if (user) {
          data.lightStatus = user.lightStatus
        }
        io.emit('light', data)
        res.send(JSON.stringify(data))
      })
      .catch(err => {
        console.log(err)
        data.lightStatus = 'err'
        data.error = err
        io.emit('light', data)
      })
})

server.listen(3000)
