var io;
var gameSocket;
var roomInfo = new Object();

exports.initGame = function(sio, socket){
    io = sio;
    gameSocket = socket;
    gameSocket.emit('connected', { message: "You are connected!" });
    //gameSocket.on('hostCreateNewGame', hostCreateNewGame);
    //gameSocket.on('playerJoinGame', playerJoinGame);
    //gameSocket.on('hostStartGame', hostStartGame);
    gameSocket.on('newUpload', onNewUpload);
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

function onNewUpload(data) {
    console.log("new upload!!" + data.bodyText);
}

function findClientsSocketByRoomId(roomId) {
    var res = []
    , room = io.sockets.adapter.rooms[roomId];
    if (room) {
        for (var id in room) {
        res.push(io.sockets.adapter.nsp.connected[id]);
        }
    }
    return res;
}

function messageReceived(data) {
    if (data.inputText.length > 0) {
        console.log("send message!! " + data.gameId + " " + data.inputText + " " + data.pName);
        io.sockets.in(data.gameId).emit('newMessageSent', data);
        var room = io.nsps['/'].adapter.rooms[data.gameId+""];
        // If the room exists...
        if( room != undefined ){
            console.log("the rooms here okay?");
        }
        else {
            console.log("the room doen't exit anymore?!?!?");
        }
    }
}

// second thing that happens when clicked
function hostCreateNewGame(data) {
    // Create a unique Socket.IO Room
    var thisGameId = randomString(7,'01234567890123456789ABCDEFGHIJKLMNOPQRSSTUVWXYZ');
    // Return the Room ID (gameId) and the socket ID (mySocketId) to the browser client
    // Join the Room and wait for the players
    this.join(thisGameId+""); // akshay change this later??
    var data = {playerName: data.playerName, mySocketId: this.id};
    roomInfo[thisGameId] = [data];
    this.emit('newGameCreated', {gameId: thisGameId, mySocketId: this.id, allPlayerNames:roomInfo[thisGameId]});
}
/*
function shuffleString (inpString) {
    var a = inpString.split(""),
        n = a.length;

    for(var i = n - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = a[i];
        a[i] = a[j];
        a[j] = tmp;
    }
    return a.join("");
}*/

function randomString(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
}

function hostStartGame(stuff) {
    //var letters = shuffleString("AAAAAAAAAAAAABBBCCCDDDDDDEEEEEEEEEEEEEEEEEEFFFGGGGHHHIIIIIIIIIIIIJJKKLLLLLMMMNNNNNNNNOOOOOOOOOOOPPPQQRRRRRRRRRSSSSSSTTTTTTTTTUUUUUUVVVWWWXXYYYZZ");
    var data =  stuff.gameId;
    io.sockets.in(data).emit('gameStarted', {gameId: stuff.gameId, letternum:0, players:stuff.players});
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
        this.join(data.gameId+"");
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