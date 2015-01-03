var io;
var gameSocket;
var roomInfo = new Object();

exports.initGame = function(sio, socket){
    io = sio;
    gameSocket = socket;
    console.log(socket.id);
    gameSocket.emit('connected', { message: "You are connected!" });
    gameSocket.on('hostCreateNewGame', hostCreateNewGame);
    gameSocket.on('playerJoinGame', playerJoinGame);
    gameSocket.on('hostStartGame', hostStartGame);
}
/*
exports.endGame = function(sio,socket) {
    console.log("someone left the room!!");
    for (var key in roomInfo) {
        for (var person in roomInfo) {
            if (person.mySocketId == socket.id) {
                delete person;
            }
        }
    }
}
*/
// second thing that happens when clicked
function hostCreateNewGame(data) {
    // Create a unique Socket.IO Room
    var thisGameId = randomString(7,'01234567890123456789ABCDEFGHIJKLMNOPQRSSTUVWXYZ');
    // Return the Room ID (gameId) and the socket ID (mySocketId) to the browser client
    // Join the Room and wait for the players
    this.join(thisGameId); // akshay change this later??
    var data = {playerName: data.playerName, mySocketId: this.id};
    roomInfo[thisGameId] = [data];
    this.emit('newGameCreated', {gameId: thisGameId, mySocketId: this.id, allPlayerNames:roomInfo[thisGameId]});
}

function randomString(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
}

function hostStartGame(data) {
    console.log("game " + data + " has started!");
    io.sockets.in(data).emit('gameStarted', data);
}

function playerJoinGame(data) {
    console.log('Player ' + data.playerName + ' attempting to join game: ' + data.gameId );
    // A reference to the player's Socket.IO socket object
    var sock = this;
    // Look up the room ID in the Socket.IO manager object.
    var room = io.nsps['/'].adapter.rooms[data.gameId+""];
    // If the room exists...
    if( room != undefined ){
        // attach the socket id to the data object.
        data.mySocketId = sock.id;
        // Join the room
        this.join(data.gameId);
        roomInfo[data.gameId].push({playerName: data.playerName, mySocketId: sock.id});
        console.log(data.gameId + "  " + roomInfo[data.gameId]);
        console.log('Player ' + data.playerName + ' joining game: ' + data.gameId );
        var data = {gameId:data.gameId, playerName: data.playerName, allPlayerNames:roomInfo[data.gameId]};
        // Emit an event notifying the clients that the player has joined the room.
        io.sockets.in(data.gameId).emit('playerJoinedRoom', data);
    } else {
        // Otherwise, send an error message back to the player.
        sock.emit('errorAlert',{message: "This room does not exist."} );
    }
}