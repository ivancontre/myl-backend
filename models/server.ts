import express from 'express';
import cors from 'cors';
import * as socketio from 'socket.io';
import { createServer, Server as ServerHttp } from 'http';

var multer = require('multer');
var upload = multer();

import authRoutes from '../routes/auth';
import cardRoutes from '../routes/card';
import typeRoutes from '../routes/type';
import frecuencyRoutes from '../routes/frecuency';
import raceRoutes from '../routes/race';
import editionRoutes from '../routes/edition';

import path from 'path';
import { dbConnection } from '../database/config';

import Sockets from './sockets';

export default class Server {
    app: express.Application;
    port: string;
    paths: any;
    server: ServerHttp;
    io: socketio.Server;
    sockets: Sockets;

    constructor() {

        this.app  = express();
        this.port = process.env.PORT || '8080';
        this.server = createServer(this.app);
        this.io = new socketio.Server(this.server);
        this.sockets = new Sockets( this.io );

        this.paths = {
            auth: '/api/auth',
            card: '/api/card',
            type: '/api/type',
            frecuency: '/api/frecuency',
            race: '/api/race',
            edition: '/api/edition'
        };
    }

    middlewares() {
        // Desplegar el directorio público
        this.app.use( express.static( path.resolve( __dirname, '../public' ) ) );

        // Indica el tipo de dato que vendrá
        this.app.use(express.json());

        // CORS
        this.app.use( cors() );

    }

    routes() {
        this.app.use(this.paths.auth, authRoutes);
        this.app.use(this.paths.card, cardRoutes);
        this.app.use(this.paths.type, typeRoutes);
        this.app.use(this.paths.frecuency, frecuencyRoutes);
        this.app.use(this.paths.race, raceRoutes);
        this.app.use(this.paths.edition, editionRoutes);
    }

    async connectToDB() {
        await dbConnection();
    }

    execute() {

        // Conectar a base de datos
        this.connectToDB();

        // Inicializar Middlewares
        this.middlewares();

        this.routes();

        // Inicializar Server
        this.server.listen( this.port, () => {
            console.log('Server corriendo en puerto:', this.port );
        });
    }

}