import { Request, Response} from 'express';
import { EditionModel } from '../models';

export const getEdition = async (req: Request, res: Response) => {

    try {

        const editions = await EditionModel.find();

        return res.status(200).json(editions);

        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: 'Por favor hable con el administrador'
        });
    }
} 