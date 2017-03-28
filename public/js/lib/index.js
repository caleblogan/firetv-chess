const qwest = require('qwest')
const io = require('socket.io-client')

let config
try {
  config = require('../../../../firetv_chess_config.json')
} catch(err) {
  console.log('Config File not found:', err)
}

const HOST = config['host']
const PORT = config['port']
const userId = config['userId']
const sock = io(HOST + ':' + PORT)

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
