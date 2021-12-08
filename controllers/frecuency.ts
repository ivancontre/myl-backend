import { Request, Response} from 'express';
import { FrecuencyModel } from '../models';

export const getFrecuency = async (req: Request, res: Response) => {

    try {

        const frecuency = await FrecuencyModel.find().sort('name');

        return res.status(200).json(frecuency);

        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: 'Por favor hable con el administrador'
        });
    }
} 