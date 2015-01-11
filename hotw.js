var io;
var gameSocket;
var roomInfo = new Object();
var mongoose = require('mongoose');

var db = mongoose.connection;

db.on('error', console.error);
db.once('open', function() {
  // Create your schemas and models here.
});

mongoose.connect('mongodb://localhost/test');
//var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var picSchema = new Schema({
  username: String,
  imgName: String,
  location: String, 
  bodyText: String
});

var Picture = mongoose.model('Picture', picSchema);

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
    console.log("new upload!!" + data.bodyText + " " + data.imageName);
    var newPic = new Picture({
          username: 'default'
        , imgName: data.imageName
        , locationText : data.locationText // Notice the use of a String rather than a Number - Mongoose will automatically convert this for us.
        , bodyText: data.bodyText
        });

    newPic.save(function(err,  newPic) {
      if (err) return console.error(err);
      console.log(newPic);
    });

    Picture.find(function(err, allPics) {
      if (err) return console.error(err);
      console.log(allPics);
    });
}

 
 