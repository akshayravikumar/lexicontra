//var app = require('express')();
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path');
var multer  = require('multer');
/*
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
  Username: String,
  imgName: String,
  location: String, 
  bodyText: String
});

var Picture = mongoose.model('Picture', picSchema);
*/
server.listen(3000);
var ang = require('./hotw');


app.use(multer({ dest: './uploads/',
 rename: function (fieldname, filename) {
    return filename;
  },
onFileUploadStart: function (file) {
  console.log(file.originalname + ' is starting ...')
},
onFileUploadComplete: function (file) {
  console.log(file.fieldname + ' uploaded to  ' + file.path)
  done=true;
}
}));


app.use(express.static(path.join(__dirname,'public')));

var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
    ang.initGame(io, socket);
});




