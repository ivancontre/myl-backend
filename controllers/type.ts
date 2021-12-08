import { Request, Response} from 'express';
import { TypeModel } from '../models';

export const getType = async (req: Request, res: Response) => {

    try {

        const types = await TypeModel.find().sort('name');

        return res.status(200).json(types);

        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: 'Por favor hable con el administrador'
        });
    }
} 