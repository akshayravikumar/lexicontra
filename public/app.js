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
        },

        onConnected : function(data) {
            //bootbox.alert("Hello world!");
            //App.mySocketId = IO.socket.engine.id;
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

        myName:'',

        init: function () {
            App.cacheElements();
            App.showInitScreen();
            App.bindEvents();
            //console.log("initializing");
        },

        cacheElements: function () {
            App.$doc = $(document);
            // Templates
            App.$gameArea = $('#mainArea');
            App.$templateIntroScreen = $('#intro-screen-template').html();
        }, 

        bindEvents: function () {
            $('#uploadForm').submit(App.onUpload);
        },


        onUpload: function () {
            var data = {imageName: $("#inputImage").val(), 
                        locationText: $("inputLocation").val(),
                        bodyText: $("#inputBody").val()
                        };    
            IO.socket.emit('newUpload', data);    
        },

        showInitScreen: function() {
            App.$gameArea.html(App.$templateIntroScreen);
        },

    };

    IO.init();
    App.init();

}($));






