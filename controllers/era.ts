import { Request, Response} from 'express';
import { EraModel, IEdition, IRace, RaceModel } from '../models';

export const getEra = async (req: Request, res: Response) => {

    try {

        const eras = await EraModel.find().populate('editions')

        const races = await RaceModel.find()

        const newEras = eras.map(era => {
            return {
                id: era.id,
                name: era.name,
                editions: era.editions.map((edition: IEdition) => {
                    return {
                        id: edition.id,
                        name: edition.name,
                        races: edition.races.map( (race: any) => {
                            const r = races.find(rac => rac.id === race.toString()) as IRace;
                            return {
                                id: r._id.toString(),
                                name: r.name
                            }
                        }).sort(function(a: any, b: any){
                            if(a.name < b.name) { return -1; }
                            if(a.name > b.name) { return 1; }
                            return 0;
                        })
                    }
                })
            }
        })

        return res.status(200).json(newEras);

        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: 'Por favor hable con el administrador'
        });
    }
} 