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
            console.log("initializing IO");
        },
        /**
         * While connected, Socket.IO will listen to the following events emitted
         * by the Socket.IO server, then run the appropriate function.
         */
        bindEvents : function() {
            IO.socket.on('connected', IO.onConnected );
            IO.socket.on('newGameCreated', IO.onNewGameCreated );
            IO.socket.on('playerJoinedRoom', IO.playerJoinedRoom );
        },

        onConnected : function(data) {
            // Cache a copy of the client's socket.IO session ID on the App
            alert(data.message);
            //App.mySocketId = IO.socket.engine.id;
            //alert(App.mySocketId + " IS THE ID");
        },


        // what happens when the game is created, we have the game id and socket it
        onNewGameCreated : function(data) {
            App.Host.gameInit(data);
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
            App.$hostGame = $('#game-template').html();
            App.$templateNewGame = $('#new-game-template').html();
        },

        bindEvents: function () {
            // Host
            console.log("bind events happening");
            //App.$doc.on('click', '#btnCreateGame', App.Host.onCreateClick);
            $('#btnCreateGame').click(App.Host.onCreateClick);
            // Player
            //App.$doc.on('click', '#btnJoinGame', App.Player.onJoinClick);
        },

        showInitScreen: function() {
            App.$gameArea.html(App.$templateIntroScreen);
        },

        Host : {
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
                IO.socket.emit('hostCreateNewGame');
            },


            // now, we have all the necessary game id's and shit
            gameInit: function (data) {
                App.gameId = data.gameId;
                App.mySocketId = data.mySocketId;
                App.myRole = 'Host';
                App.Host.numPlayersInRoom = 0;

                App.Host.displayNewGameScreen();
                alert("Game started with ID: " + App.gameId + ' by host: ' + App.mySocketId);
            },

            displayNewGameScreen : function() {
                // Fill the game screen with the appropriate HTML
                App.$gameArea.html(App.$templateNewGame);
                //alert(io.sockets.adapter.rooms + "are all the rooms now");

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






