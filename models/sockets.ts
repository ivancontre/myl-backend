import * as socketio from 'socket.io';
import { v4 as uuid } from 'uuid';
import { getUser, getUsers, userConnected, userDisconnected } from '../controllers';
import { checkJWT } from '../helpers';

export default class Sockets {
    io: socketio.Server;

    constructor( io: socketio.Server ) {
        this.io = io;
        this.socketEvents();
    }

    socketEvents() {

        let users: any[] = [];

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
            
            const exists = users.find((item: any) => item.id === id);

            if (!exists) {
                users = [...users, {
                    id,
                    socketId: socket.id
                }];
            } else {
                users = users.map((item: any) => {
                    if (item.id === id) {
                        return {
                            ...item,
                            socketId: socket.id
                        }
                    }

                    return item;
                })
            }

            socket.join(id);

            this.io.emit('active-users-list', await getUsers());

            // ************************** INVITATION **************************

            socket.on('invite', async (payload: any) => {
                const userOpponent = await getUser(payload.opponentId);
                
                if (!userOpponent?.playing) {
                    this.io.to(payload.opponentId).emit('send-notification', { from: user?.username, id: user?.id, key: payload.key });
                }

            });

            socket.on('cancele-invitation', async (payload: any) => {

                const userOpponent = await getUser(payload.opponentId);

                if (!userOpponent?.playing) {
                    this.io.to(payload.opponentId).emit('cancele-notification', { key: payload.key });
                }

            });

            // ************************** MATCH **************************

            socket.on('create-match', async (payload: any) => {
                const { opponentId } = payload;

                // TODO: cambiar playing a true
                //await setPlaying(id, true);
                //await setPlaying(opponentId, true);
                this.io.emit('active-users-list', await getUsers());

                const matchId = uuid();
                socket.join(matchId);

                const opponentUser = users.find((item: any) => item.id === opponentId);

                const opponentSocket = this.io.sockets.sockets.get(opponentUser.socketId);

                opponentSocket?.join(matchId);        

                this.io.to(opponentId).emit('go-match', { opponentId: id, matchId });
                this.io.to(id).emit('go-match', { opponentId, matchId }); 
            });

            socket.on('leave-match', async (payload: any) => {
                socket.leave(payload.matchId);
                socket.broadcast.to(payload.matchId).emit('opponent-leave-match');
                // TODO: Actualizar estadisticas en mongoBD del jugador ganador

            });

            socket.on('changing', (data: any) => {
                socket.broadcast.to(data.matchId).emit('changing-opponent', data.match);                 
            });

            socket.on('update-match-opponent', (data: any) => {
                socket.broadcast.to(data.matchId).emit('updating-match-opponent', data.match);      
            });

            socket.on('show-clastle-to-opponent', (data: any) => {
                socket.broadcast.to(data.matchId).emit('showing-clastle-to-opponent', data);                 
            });

            socket.on('show-hand-to-opponent', (data: any) => {
                socket.broadcast.to(data.matchId).emit('showing-hand-to-opponent', data);    
            });

            socket.on('disconnect', async (data: any) => {
                  
                const user = await userDisconnected(id);  
                this.io.emit('active-users-list', await getUsers());

                //socket.leave(payload.matchId);
                //socket.broadcast.to(payload.matchId).emit('opponent-leave-match');  


                console.log('cliente desconectado: ' + user?.name);

            });
        
        });
    }

};