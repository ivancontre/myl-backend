import { Console } from 'console';
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
        let matchs: any = {};

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
                    socketId: socket.id,
                    username: user?.username
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
                });
            }

            if (user?.playing) {
                for (const key of Object.keys(matchs)) {

                    if (id === matchs[key].id || id === matchs[key].opponentId) {
                        console.log('recovery-after-reload')
                        const matchId = 'room_' + uuid();
    
                        matchs[matchId] = matchs[key]
                        matchs[matchId].matchId = matchId;
                        
                        delete matchs[key];                        
                        
                        socket.leave(key);
                        socket.join(matchId);
    
                        const opponentId = id === matchs[matchId].id ? matchs[matchId].opponentId : matchs[matchId].id;
                        const opponentUser = users.find((user: any) => user.id === opponentId);
                        const opponentSocket = this.io.sockets.sockets.get(opponentUser.socketId);
                        opponentSocket?.leave(key);
                        opponentSocket?.join(matchId);
                        const userOpponent = await userConnected(opponentId);      
                        
                        let message = {
                            id,
                            username: user?.username,
                            text: 'Conectado',
                            isAction: true,
                            date: moment()
                        };

                        matchs[matchId].messages.push(message);
                        

                        setTimeout(() => {
                            this.io.to(id).emit('recovery-after-reload', { 
                                matchId,
                                match: id === matchs[matchId].id ? matchs[matchId].cards1 : matchs[matchId].cards2,
                                opponentMatch: id === matchs[matchId].id ? matchs[matchId].cards2 : matchs[matchId].cards1,
                                opponentId,
                                messages: matchs[matchId].messages,
                                opponentUsername: userOpponent?.username
                            });
    
                            this.io.to(opponentId).emit('recovery-after-reload-opponent', { 
                                matchId
                            });

                            this.io.to(opponentId).emit('receive-personal-message', message);
    
                        }, 1000);

                        
                        
                    }
                }
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

                for (const key of Object.keys(matchs)) {
                    
                    if (id == matchs[key].id || id == matchs[key].opponentId || opponentId == matchs[key].id || opponentId == matchs[key].opponentId) {
                        delete matchs[key];
                        socket.leave(matchId);
                    }

                }

                const opponentUser = users.find((item: any) => item.id === opponentId);

                if (opponentUser) {
                    const opponentSocket = this.io.sockets.sockets.get(opponentUser.socketId);
                    opponentSocket?.leave(matchId);
                    await setPlaying(opponentId, false);
                }

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
                
                for (const key of Object.keys(matchs)) {
                    if (id == matchs[key].id || id == matchs[key].opponentId || opponentId == matchs[key].id || opponentId == matchs[key].opponentId) {
                        delete matchs[key];
                    }
                }

                matchs[matchId] = {
                    id,
                    opponentId,
                    messages: [],
                    cards1: {},
                    cards2: {},
                    phase: null
                };
                
                const userOpponent = await userConnected(opponentId);
                
                this.io.to(opponentId).emit('go-match', { opponentId: id, matchId, opponentUsername: user?.username });
                this.io.to(id).emit('go-match', { opponentId, matchId, opponentUsername: userOpponent?.username});

                console.log('New match: ', matchId, `- Inviting: ${userOpponent?.username} (${opponentId})`, `- Invited: ${user?.username} (${id})`);

                this.io.emit('active-users-list', await getUsers());
            });

            socket.on('close-match', async ({ matchId, opponentId }: any,  callback: Function) => {

                socket.broadcast.to(matchId).emit('you-win-match');
                const opponentUser = users.find((item: any) => item.id === opponentId);
                const opponentSocket = this.io.sockets.sockets.get(opponentUser.socketId);
                opponentSocket?.leave(matchId);
                socket?.leave(matchId);

                delete matchs[matchId];

                const userOpponent = await userConnected(opponentId);

                if (userOpponent?.online) {
                    await setResults(id, false);
                    await setResults(opponentId, true);
                } else {
                    await setResults(id, true);
                    await setResults(opponentId, false);
                }                

                await setPlaying(id, false);
                await setPlaying(opponentId, false);
                
                await setLastTimePlaying(id);
                await setLastTimePlaying(opponentId);

                this.io.emit('active-users-list', await getUsers());
                callback();
            });

            socket.on('request-leave-mutual-match', ({ matchId }: any) => {
                console.log(id, 'request-leave-mutual-match', matchId)
                socket.broadcast.to(matchId).emit('request-opponent-leave-mutual-match');
            });

            socket.on('approve-request-leave-mutual-match', async ({ matchId, opponentId }: any, callback: Function) => {
                socket.leave(matchId);
                socket.broadcast.to(matchId).emit('finish-approve-leave-mutual-match');

                const opponentUser = users.find((item: any) => item.id === opponentId);
                const opponentSocket = this.io.sockets.sockets.get(opponentUser.socketId);
                opponentSocket?.leave(matchId);

                delete matchs[matchId];

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

                delete matchs[matchId];

                const userOpponent = await userConnected(opponentId);

                if (userOpponent?.online) {
                    await setResults(id, false);
                    await setResults(opponentId, true);
                } else {
                    await setResults(id, true);
                    await setResults(opponentId, false);
                }

                await setPlaying(id, false);
                await setPlaying(opponentId, false);

                await setLastTimePlaying(id);
                await setLastTimePlaying(opponentId);

                this.io.emit('active-users-list', await getUsers());

            }); 

            socket.on('changing', ({ matchId, match }: any) => {
                if (matchs[matchId]) {
                    if (id === matchs[matchId].id) {
                        matchs[matchId].cards1 = match
                    } else {
                        matchs[matchId].cards2 = match
                    }
                }               
                socket.broadcast.to(matchId).emit('changing-opponent', match);
                             
            });

            socket.on('setting-phase', ({ matchId, phase }: any) => {
                if (matchs[matchId]) matchs[matchId].phase = phase;
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
                matchs[matchId] && matchs[matchId].messages.push(message);  
                socket.broadcast.to(matchId).emit('receive-personal-message', message);
                callback(message.date);          
            });

            socket.on('disconnect', async (data: any) => {               
                
                if (matchs) {

                    for (const key of Object.keys(matchs)) {
                        if (id == matchs[key].id || id == matchs[key].opponentId) {

                            let message = {
                                id,
                                username: users.find((user) => user.id === id).username,
                                text: 'Desconectado',
                                isAction: true,
                                date: moment()
                            };
                            
                            matchs[key].messages.push(message);
                            socket.broadcast.to(key).emit('receive-personal-message', message);
                            break;
                        }
                    }
                    
                }

                const user = await userDisconnected(id);
                console.log('Cliente desconectado', user?.name);
                await setLastTimeOnline(id);
                this.io.emit('active-users-list', await getUsers());

            });
        
        });
    }

};