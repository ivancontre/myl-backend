import { connect } from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const uri: string = process.env.MONGODB_CNN as string;

export const dbConnection = async () => {

    try {
        
        await connect(uri);

        console.log('DB online');

    } catch (error) {
        console.log(error);
        throw new Error('Error al inicializar BD');
    }
}