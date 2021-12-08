import { Request, Response} from 'express';
import { EditionModel } from '../models';

export const getEdition = async (req: Request, res: Response) => {

    try {

        const editions = await EditionModel.find().sort('name').populate('races');

        const newEditions = editions.map(edition => {
            return {
                id: edition.id,
                name: edition.name,
                races: edition.races.map(race => {
                    return {
                        id: race.id,
                        name: race.name
                    }
                }).sort(function(a, b){
                    if(a.name < b.name) { return -1; }
                    if(a.name > b.name) { return 1; }
                    return 0;
                })
            }
        })

        return res.status(200).json(newEditions);

        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: 'Por favor hable con el administrador'
        });
    }
} 