import { Request, Response} from 'express';
import { RaceModel } from '../models';

export const getRace = async (req: Request, res: Response) => {

    try {

        const races = await RaceModel.find().sort('name');

        return res.status(200).json(races);

        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: 'Por favor hable con el administrador'
        });
    }
} 