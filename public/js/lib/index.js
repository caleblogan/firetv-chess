const qwest = require('qwest')
const sock = require('socket.io-client')('http://192.168.1.192:3000')
// const ChessBoard = require('../../../chessboardjs-0.3.0/js/chessboard-0.3.0')

const DEFAULT_LIGHT_STATUS = 'Not Set'
const BASE_URL = 'localhost:3000'

window.onload = function() {
  let config = {
    draggable: true,
    position: 'start',
    pieceTheme: '/chessboardjs/img/chesspieces/wikipedia/{piece}.png'
  }
  let board = ChessBoard('board', config)

  // let lightStatusElem = document.querySelector('#lightStatus')
  // lightStatusElem.innerHTML = lightStatus.innerHTML || DEFAULT_LIGHT_STATUS

  // sock.on('connect', () => {
  //   console.log('Successfully connected')
  // })
  // sock.emit('light', {lightStatus: DEFAULT_LIGHT_STATUS})
  // sock.on('light', function(data) {
  //   console.log('sock light data:', data)
  //   lightStatusElem.innerHTML = data.lightStatus
  //   document.body.style['background-color'] = data.lightStatus === 'on' ? 'white' : 'black'
  // })


}
