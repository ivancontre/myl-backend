import { Request, Response} from 'express';
import { EditionModel } from '../models';

export const getEdition = async (req: Request, res: Response) => {

    try {
        
        const editions = await EditionModel.find(req.user.role === 'ADMIN_ROLE' ? {} : {status: true}).sort('era').populate('races').populate('era')
        const newEditions = editions.map(edition => {
            return {
                id: edition.id,
                name: edition.name,
                era: edition.era.name,
                races: edition.races.map(race => {
                    return {
                        id: race.id,
                        name: race.name
                    }
                }).sort(function(a, b){
                    if(a.name < b.name) { return -1; }
                    if(a.name > b.name) { return 1; }
                    return 0;
                }),
                status: edition.status,
                releaseDate: edition.releaseDate
            }
        }).sort(function(a, b){
            if(a.releaseDate < b.releaseDate) { return -1; }
            if(a.releaseDate > b.releaseDate) { return 1; }
            return 0;
        })

        return res.status(200).json(newEditions);

        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: 'Por favor hable con el administrador'
        });
    }
} 