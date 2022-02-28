import { Request, Response} from 'express';
import { EraModel, IEdition, IRace, RaceModel } from '../models';

export const getEra = async (req: Request, res: Response) => {

    try {

        let erasCondition: any = {};

        if (req.user.role === 'USER_ROLE') {
            erasCondition.status = true;
        }

        const eras = await EraModel.find(erasCondition).populate('editions')

        const races = await RaceModel.find()

        const newEras = eras.map(era => {

            let editions = era.editions.map((edition: IEdition) => {
                return {
                    id: edition.id,
                    name: edition.name,
                    status: edition.status,
                    era: edition.era,
                    releaseDate: edition.releaseDate,
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
                
            }).sort(function(a: any, b: any){
                if(a.releaseDate < b.releaseDate) { return -1; }
                if(a.releaseDate > b.releaseDate) { return 1; }
                return 0;
            })

            if (req.user.role === 'USER_ROLE') {
                editions = editions.filter((edition: any) => edition.status === true);
            }
            
            return {
                id: era.id,
                name: era.name,
                editions
            }
        })

        return res.status(200).json(newEras);

        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: 'Por favor hable con el administrador'
        });
    }
};

export const getEraAvailable = async (req: Request, res: Response) => {

    try {

        const eras = await EraModel.find({ status: true }).populate('editions')

        const races = await RaceModel.find()

        const newEras = eras.map(era => {

            let editions = era.editions.filter((edition: any) => edition.status === true).map((edition: IEdition) => {
                return {
                    id: edition.id,
                    name: edition.name,
                    status: edition.status,
                    era: edition.era,
                    releaseDate: edition.releaseDate,
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
                
            }).sort(function(a: any, b: any){
                if(a.releaseDate < b.releaseDate) { return -1; }
                if(a.releaseDate > b.releaseDate) { return 1; }
                return 0;
            })

            editions = editions.filter((edition: any) => edition.status === true);
            
            return {
                id: era.id,
                name: era.name,
                editions
            }
        })

        return res.status(200).json(newEras);

        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: 'Por favor hable con el administrador'
        });
    }
};