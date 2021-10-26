import * as socketio from 'socket.io';
import { v4 as uuid } from 'uuid';
import { getUser, getUsers, setPlaying, userConnected, userDisconnected } from '../controllers';
import { checkJWT } from '../helpers';

export default class Sockets {
    io: socketio.Server;

    constructor( io: socketio.Server ) {
        this.io = io;
        this.socketEvents();
    }

    socketEvents() {
        // On connection
        this.io.on('connection', async ( socket ) => {


            const token = socket.handshake.query['x-token'];

            const [valid, id] = checkJWT(token);

            if (!valid) {
                console.log('socket no identificado');
                return socket.disconnect();
            }

            const user = await userConnected(id);
            console.log('cliente conectado: ' + user?.name);
            socket.join(id);

            socket.on('invite', async (payload: any) => {
                const userOpponent = await getUser(payload.opponentId);

                if (!userOpponent?.playing) {
                    this.io.to(payload.opponentId).emit('send-notification', {from: user?.username, id: user?.id});
                }                
            });

            socket.on('create-match', async (payload: any) => {
                const { opponentId } = payload;

                // TODO: cambiar playing a true
                //await setPlaying(id, true);
                //await setPlaying(opponentId, true);
                this.io.emit('active-users-list', await getUsers());

                const matchId = uuid();
                //socket.join(matchId);

                this.io.to(opponentId).emit('go-match', { opponentId: id });
                this.io.to(id).emit('go-match', { opponentId });              
            })

            this.io.emit('active-users-list', await getUsers());

            socket.on('changing', (data: any) => {
                this.io.to(data.opponentId).emit('changing-oponent', data.match);                 
            });

            socket.on('disconnect', async (data: any) => {
                  
                const user = await userDisconnected(id);  
                this.io.emit('active-users-list', await getUsers())
                console.log('cliente desconectado: ' + user?.name);

            });



        
        });
    }

};