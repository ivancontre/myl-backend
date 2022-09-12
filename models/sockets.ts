import moment from 'moment';
import * as socketio from 'socket.io';
import { v4 as uuid } from 'uuid';
import { getUser, getUsers, setLastTimeOnline, setLastTimePlaying, setPlaying, setResults, userConnected, userDisconnected } from '../controllers';
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
                        delete item.matchId;
                        delete item.mutualLeave;
                        return {
                            ...item,
                            socketId: socket.id
                        }
                    }

                    return item;
                });

            }

            //console.log(users);

            socket.join(id);

            this.io.emit('active-users-list', await getUsers());

            // ************************** INVITATION **************************

            socket.on('invite', async ({ opponentId, key }: any) => {
                const userOpponent = await getUser(opponentId);
                
                if (!userOpponent?.playing) {
                    this.io.to(opponentId).emit('send-notification', { from: user?.username, id: user?.id, key });
                }

            });

            socket.on('cancele-invitation', async ({ opponentId, key }: any) => {

                const userOpponent = await getUser(opponentId);

                if (!userOpponent?.playing) {
                    this.io.to(opponentId).emit('cancele-notification', { key });
                }

            });

            // ************************** MATCH **************************

            socket.on('force-match-exit', async ({ matchId, opponentId }: any, callback: Function) => {

                await setPlaying(id, false);

                const meUser = users.find((item: any) => item.id === id && item.matchId === matchId);

                if (meUser) {
                    socket.leave(matchId);
                }

                const opponentUser = users.find((item: any) => item.id === opponentId && item.matchId === matchId);

                if (opponentUser) {
                    const opponentSocket = this.io.sockets.sockets.get(opponentUser.socketId);
                    opponentSocket?.leave(matchId);
                    await setPlaying(opponentId, false);
                }

                users = users.map((item: any) => {
                    if (item.matchId === matchId && (item.id === id || item.id === opponentId)) {
                        delete item.matchId;
                        return {
                            ...item
                        }
                    }

                    return item;
                });

                this.io.emit('active-users-list', await getUsers());

                callback(null, true);

            });

            socket.on('opponent-match-not-charged', async ({ matchId }: any) => {
                socket.broadcast.to(matchId).emit('get-opponent-match-not-charged');
            });

            socket.on('play-open-hand', async ({ matchId, playOpenHand }: any) => {
                socket.broadcast.to(matchId).emit('playing-open-hand', { playOpenHand });
            });

            socket.on('create-match', async ({ opponentId }: any) => {
                
                await setPlaying(id, true);
                await setPlaying(opponentId, true);                
                
                const matchId = 'room_' + uuid();
                socket.join(matchId);
                const opponentUser = users.find((item: any) => item.id === opponentId);
                const opponentSocket = this.io.sockets.sockets.get(opponentUser.socketId);
                opponentSocket?.join(matchId);
                
                users = users.map((item: any) => {
                    if (item.id === id || item.id === opponentId) {
                        return {
                            ...item,
                            matchId
                        }
                    }

                    return item;
                });
                
                const userOpponent = await userConnected(opponentId);
                
                this.io.to(opponentId).emit('go-match', { opponentId: id, matchId, opponentUsername: user?.username });
                this.io.to(id).emit('go-match', { opponentId, matchId, opponentUsername: userOpponent?.username});

                console.log('New match: ', matchId, `- Inviting: ${userOpponent?.username} (${opponentId})`, `- Invited: ${user?.username} (${id})`);

                this.io.emit('active-users-list', await getUsers());
            });

            socket.on('recovery-match', async ({ opponentId }: any) => {
                
                await setPlaying(id, true);
                await setPlaying(opponentId, true);                
                
                const matchId = 'room_' + uuid();
                socket.join(matchId);
                const opponentUser = users.find((item: any) => item.id === opponentId);
                const opponentSocket = this.io.sockets.sockets.get(opponentUser.socketId);
                opponentSocket?.join(matchId);
                
                users = users.map((item: any) => {
                    if (item.id === id || item.id === opponentId) {
                        return {
                            ...item,
                            matchId
                        }
                    }

                    return item;
                });
                
                const userOpponent = await userConnected(opponentId);
                
                this.io.to(opponentId).emit('go-match', { opponentId: id, matchId, opponentUsername: user?.username, recovery: true });
                this.io.to(id).emit('go-match', { opponentId, matchId, opponentUsername: userOpponent?.username, recovery: true});

                console.log('New match: ', matchId, `- Inviting: ${userOpponent?.username} (${opponentId})`, `- Invited: ${user?.username} (${id})`);

                this.io.emit('active-users-list', await getUsers());
            });

            socket.on('close-match', async ({ matchId, opponentId }: any,  callback: Function) => {
                socket.broadcast.to(matchId).emit('you-win-match');
                const opponentUser = users.find((item: any) => item.id === opponentId);
                const opponentSocket = this.io.sockets.sockets.get(opponentUser.socketId);
                opponentSocket?.leave(matchId);
                socket?.leave(matchId);

                await setResults(id, false);
                await setResults(opponentId, true);

                await setPlaying(id, false);
                await setPlaying(opponentId, false);
                
                await setLastTimePlaying(id);
                await setLastTimePlaying(opponentId);

                this.io.emit('active-users-list', await getUsers());
                callback();
            });

            socket.on('request-leave-mutual-match', ({ matchId }: any) => {
                socket.broadcast.to(matchId).emit('request-opponent-leave-mutual-match');
            });

            socket.on('approve-request-leave-mutual-match', async ({ matchId, opponentId }: any, callback: Function) => {
                socket.leave(matchId);
                socket.broadcast.to(matchId).emit('finish-approve-leave-mutual-match');

                const opponentUser = users.find((item: any) => item.id === opponentId);
                const opponentSocket = this.io.sockets.sockets.get(opponentUser.socketId);
                opponentSocket?.leave(matchId);
                
                users = users.map((item: any) => {
                    if (item.id === id || item.id === opponentId) {
                        delete item.matchId;
                        return {
                            ...item,
                            mutualLeave: true
                        }
                    }

                    return item;
                });

                await setPlaying(id, false);
                await setPlaying(opponentId, false);

                await setLastTimePlaying(id);
                await setLastTimePlaying(opponentId);

                this.io.emit('active-users-list', await getUsers());

                callback();

            });

            socket.on('reject-request-leave-mutual-match', ({ matchId }: any) => {
                socket.broadcast.to(matchId).emit('finish-reject-leave-mutual-match');
            });

            socket.on('i-missed-match', async ({ matchId, opponentId }: any) => {
                socket.broadcast.to(matchId).emit('you-win-match');
                const opponentUser = users.find((item: any) => item.id === opponentId);
                const opponentSocket = this.io.sockets.sockets.get(opponentUser.socketId);
                opponentSocket?.leave(matchId);
                socket?.leave(matchId);

                await setResults(id, false);
                await setResults(opponentId, true);
                
                await setPlaying(id, false);
                await setPlaying(opponentId, false);

                await setLastTimePlaying(id);
                await setLastTimePlaying(opponentId);

                this.io.emit('active-users-list', await getUsers());

            }); 

            socket.on('changing', ({ matchId, match }: any) => {
                socket.broadcast.to(matchId).emit('changing-opponent', match);              
            });

            socket.on('setting-phase', ({ matchId, phase }: any) => {
                socket.broadcast.to(matchId).emit('setting-phase-opponent', phase);              
            });

            socket.on('update-match-opponent', ({ matchId, match }: any) => {
                socket.broadcast.to(matchId).emit('updating-match-opponent', match);      
            });

            socket.on('show-clastle-to-opponent', ({ matchId }: any) => {
                socket.broadcast.to(matchId).emit('showing-clastle-to-opponent');                 
            });

            socket.on('show-x-clastle-to-opponent', ({ matchId, amountCardsView }: any) => {
                socket.broadcast.to(matchId).emit('showing-x-clastle-to-opponent', { amountCardsView });                 
            });

            socket.on('show-hand-to-opponent', ({ matchId }: any) => {
                socket.broadcast.to(matchId).emit('showing-hand-to-opponent');
            });

            socket.on('show-discard-opponent', ({ matchId }: any) => {
                socket.broadcast.to(matchId).emit('showing-discard-opponent');
            });

            socket.on('discard-to-opponent', ({ matchId, toDiscard }: any) => {
                socket.broadcast.to(matchId).emit('discarding-to-opponent', { toDiscard });
            });

            // ************************** MESSAGE **************************
            socket.on('personal-message', ({ matchId, message }: any, callback: Function) => {
                message.date = moment();                
                socket.broadcast.to(matchId).emit('receive-personal-message', message);
                callback(message.date);          
            });

            socket.on('disconnect', async (data: any) => {
                const user = await userDisconnected(id);                
                await setLastTimeOnline(id);
                
                const currentUser = users.find((item: any) => item.id === id);

                if (currentUser?.matchId && !currentUser?.mutualLeave) {

                    const matchId = currentUser?.matchId;

                    socket.broadcast.to(matchId).emit('opponent-leave-match');
                    socket.leave(matchId);

                    const opponentUserInUsers = users.find((item: any) => (item.id !== id && item.matchId === currentUser?.matchId));
                    const opponentSocket = this.io.sockets.sockets.get(opponentUserInUsers.socketId);
                    opponentSocket?.leave(matchId);

                    users = users.map((item: any) => {
                        if (item.id === opponentUserInUsers.id) {
                            delete item.matchId;
                            return {
                                ...item
                            }
                        }
    
                        return item;
                    });

                    await setResults(id, false);
                    await setResults(opponentUserInUsers.id, true);
                    await setPlaying(id, false);
                    await setPlaying(opponentUserInUsers.id, false);
                    await setLastTimePlaying(id);
                    await setLastTimePlaying(opponentUserInUsers.id);
                    
                }

                console.log('Cliente desconectado', user?.name);
                this.io.emit('active-users-list', await getUsers());

            });
        
        });
    }

};