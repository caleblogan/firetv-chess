const qwest = require('qwest')
const sock = require('socket.io-client')('http://192.168.1.192:3000')

const BASE_URL = 'localhost:3000'

const userId = 'amzn1.ask.account.AGV53DZTOOAIBHLOZQ6RBPZ4ERLC2N2CAABQ424T5NNACE3DJFX6OZMZOZNXAKLKVKAUH5R4UBB2GF3GQURHIMKTJRPK2FYDQTIDFB4J2M23FKZQINRIGAJP7675EU6EWZMBY7K6LFZJMI4N5ZXXWZMDPWMAEIKUW5USWLSIJ7EK4ND6F7GXSOGYIGPLQMTCXHACHZME7EV2BJQ'

window.onload = function() {
  let config = {
    draggable: true,
    position: 'start',
    pieceTheme: '/chessboardjs/img/chesspieces/wikipedia/{piece}.png'
  }
  let board = ChessBoard('board', config)
  $(window).resize(board.resize)

  qwest.get(`/api/fen?userId=${userId}`)
      .then(function(xhr, res) {
        let data = JSON.parse(res)
        if (data['error']) {
          console.log('Error:', data['error'])
        } else {
          board.position(data['fen'])
          updateTurnDisplay(data['turn'])
        }
      })

  sock.on('connect', () => {
    console.log('Successfully connected')
  })

  sock.on(userId, function(data) {
    console.log('Api Move:', data)
    if (data.newGame) {
      board.start()
      updateTurnDisplay(data['turn'])
    }
    if (data.from && data.to){
      board.move(data.from + '-' + data.to)
      updateTurnDisplay(data['turn'])
    }
  })

}


function updateTurnDisplay(turn) {
  if (turn === undefined) {
    turn = 'w'
  }

  if (turn === 'w') {
    turn = 'white'
  } else if (turn === 'b') {
    turn = 'black'
  }
  let turnElem = document.querySelector('#turn-content')
  turnElem.innerHTML = turn
}
