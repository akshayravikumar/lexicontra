;
jQuery(function($){    
    'use strict';

    /**
     * All the code relevant to Socket.IO is collected in the IO namespace.
     *
     * @type {{init: Function, bindEvents: Function, onConnected: Function, onNewGameCreated: Function, playerJoinedRoom: Function, beginNewGame: Function, onNewWordData: Function, hostCheckAnswer: Function, gameOver: Function, error: Function}}
     */
    var IO = {
        /**
         * This is called when the page is displayed. It connects the Socket.IO client
         * to the Socket.IO server
         */
        init: function() {
            IO.socket = io.connect();
            IO.bindEvents();
        },
        /**
         * While connected, Socket.IO will listen to the following events emitted
         * by the Socket.IO server, then run the appropriate function.
         */
        bindEvents : function() {
            IO.socket.on('connected', IO.onConnected );
            IO.socket.on('newGameCreated', IO.onNewGameCreated );
            IO.socket.on('playerJoinedRoom', IO.playerJoinedRoom );
            IO.socket.on('errorAlert', IO.errorAlert );
            IO.socket.on('gameStarted', IO.gameStarted);
        },

        playerJoinedRoom : function(data) {
            // When a player joins a room, do the updateWaitingScreen funciton.
            // There are two versions of this function: one for the 'host' and
            // another for the 'player'.
            //
            // So on the 'host' browser window, the App.Host.updateWiatingScreen function is called.
            // And on the player's browser, App.Player.updateWaitingScreen is called.
            if (App.myRole != 'Host') {
                App.$gameArea.html(App.$templateNewGame);
                $('#gameURL').text(window.location.href);
                // Show the gameId / room id on screen
                $('#spanNewGameCode').text(data.gameId);
            }
            
            App.Player.updateWaitingScreen(data);
        },

        gameStarted : function(data) {
            App.$gameArea.html(App.$gameScreen);
        },

        onConnected : function(data) {
            // Cache a copy of the client's socket.IO session ID on the App
            //App.mySocketId = IO.socket.engine.id;
            //alert(App.mySocketId + " IS THE ID");
        },


        // what happens when the game is created, we have the game id and socket it
        onNewGameCreated : function(data) {
            App.Player.gameInit(data);
            App.Player.updateWaitingScreen(data);
        },

        errorAlert : function(data) {
            alert(data.message);
        }

    };

    var App = {

        // randomly created ID
        gameId: 0,

        /**
         * This is used to differentiate between 'Host' and 'Player' browsers.
         */
        myRole: '',   // 'Player' or 'Host'

        /**
         * The Socket.IO socket object identifier. This is unique for
         * each player and host. It is generated when the browser initially
         * connects to the server when the page loads for the first time.
         */
        mySocketId: '',

        init: function () {
            App.cacheElements();
            App.showInitScreen();
            App.bindEvents();
            console.log("initializing");
        },

        cacheElements: function () {
            App.$doc = $(document);
            // Templates
            App.$gameArea = $('#gameArea');
            App.$templateIntroScreen = $('#intro-screen-template').html();
            App.$gameScreen = $('#game-template').html();
            App.$templateNewGame = $('#new-game-template').html();
        },

        

        bindEvents: function () {
            $('#btnCreateGame').click(App.Player.onCreateClick);
            // Player
            $('#btnJoinGame').click(App.Player.onJoinClick);
            //$('#btnClickStart').click(App.Player.onStartClick);
            App.$doc.on('click', '#btnClickStart',App.Player.onStartClick);
        },

        showInitScreen: function() {
            App.$gameArea.html(App.$templateIntroScreen);
        },

        Player : {
              /**
             * Contains references to player data
             */
            players : [],

            /**
             * Keep track of the number of players that have joined the game.
             */
            numPlayersInRoom: 0,

            // first thing that happens when clicked.
            onCreateClick: function () {
                var data = {
                    playerName : $('#inputPlayerName').val() || 'anon'
                };
                IO.socket.emit('hostCreateNewGame', data);
            },

            onStartClick: function () {
                IO.socket.emit('hostStartGame',App.gameId);
                alert("emitted");
            },


            onJoinClick: function () {
                 var data = {
                    gameId : $('#inputGameId').val(),
                    playerName : $('#inputPlayerName').val() || 'anon'
                };
                // Send the gameId and playerName to the server
                IO.socket.emit('playerJoinGame', data);
                App.myRole = 'Player';
                App.Player.myName = data.playerName;
            },

            updateWaitingScreen: function(data) {
                // If this is a restarted game, show the screen.
                /*if ( App.Host.isNewGame ) {
                    App.Host.displayNewGameScreen();
                }*/
                // Update host screen
                var postText = "";
                for (var i = 0; i<data.allPlayerNames.length ; i++) {
                    postText = postText + data.allPlayerNames[i].playerName + "\n";
                }
                 $('#playersWaiting').text(postText);

                // Store the new player's data on the Host.
                App.Player.players.push(data);

                // Increment the number of players in the room
                App.Player.numPlayersInRoom += 1;
                // If two players have joined, start the game!
//                if (App.Host.numPlayersInRoom === 2) {
 //                   // console.log('Room is full. Almost ready!');
//          
 //                   // Let the server know that two players are present.
 //                   IO.socket.emit('hostRoomFull',App.gameId);
 //               }
            },

            // now, we have all the necessary game id's and shit
            gameInit: function (data) {
                App.gameId = data.gameId;
                App.mySocketId = data.mySocketId;
                App.myRole = 'Host';
                App.Player.numPlayersInRoom = 0;

                App.Player.displayNewGameScreen();
               // var r= $('<input type="button" id = "btnStartGame" value="Start Game!"/>');
                //$("#hostSubmit").append(r);
                //alert("Game started with ID: " + App.gameId + ' by host: ' + App.mySocketId);
                $('#btnClickStart').removeAttr('disabled');
                App.Player.updateWaitingScreen(data);
            },

            displayNewGameScreen : function() {
                // Fill the game screen with the appropriate HTML

                App.$gameArea.html(App.$templateNewGame);

                // Display the URL on screen
                $('#gameURL').text(window.location.href);

                // Show the gameId / room id on screen
                $('#spanNewGameCode').text(App.gameId);
            }
        }


    };

    IO.init();
    App.init();

}($));






