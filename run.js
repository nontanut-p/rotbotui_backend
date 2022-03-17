'use strict';

const APIKEY = 'tuw5es5dc5w1';
const URL = 'http://agv.mtec.or.th';
//const URL = 'http://localhost:8080';
var io = require('socket.io-client');
var Client = require('./client');
var clients = [];
var socket;

process.on('SIGINT', function() {
  console.log( "\nSIGINT (Ctrl-C)" );
  process.exit(1);
});

if (require.main === module) {

  socket = io.connect( URL, {
    reconnect: true,
    secure: true,
  });
  Client.init( clients, socket )
  {
    socket.on('connect', function(){
      console.log('socket connected');

      // login
      socket.on('request_login', function(){
        console.log('request_login');
      
        socket.emit('login', {api_key: APIKEY} );
      });
      socket.on('disconnect', function(){
        console.warn('socket disconnect');
      });
      // login failed
      socket.on('unauth', ()=>{
        console.warn('unauth');
        process.exit();
      });
      // login ok
      socket.on('auth', (data)=>{
        console.log('auth ok');
      });
      // webrtc
      socket.on('message', (data)=>{
        console.log('message from '+data.from+': '+JSON.stringify(data));
        var sender_id = data.from
          , client = Client.get_client_from_socket_id(sender_id)
          , message = data.message;
        // got call from user
        if (message.type === 'call') {
          console.log('got call');
          if( client ){
            console.warn('call : client already exists');
            client.destroy();
          }
          client = Client.add_client( sender_id, message.auth_type);
          client.createPeerConnection()
          .catch((e)=>{
            console.error(e);
          });
        }
        else if (message.type === 'answer') {
          console.log('got answer');
          if( !client ){
            console.warn('answer : no client');
            return;
          }
          client.set_signal( message );
        }
        else if (message.candidate) {
          console.log('got candidate');
          if( !client ){
            console.warn('candidate : no client');
            return;
          }
          client.set_signal( message );
        }
        else{
          console.warn('unknown message');
        }
      });
    });
  };
}
