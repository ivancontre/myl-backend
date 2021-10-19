import * as socketio from 'socket.io';

export default class Sockets {
    io: socketio.Server;

    constructor( io: socketio.Server ) {
        this.io = io;
        this.socketEvents();
    }

    socketEvents() {
        // On connection
        this.io.on('connection', ( socket ) => {

            console.log('Cliente conectado');


            socket.on('changing', (data: any) => {
                socket.broadcast.emit('changing-oponent', data);                
            });


        
        });
    }

};