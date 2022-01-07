import { Request, Response} from 'express';
import { Types } from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
cloudinary.config(process.env.CLOUDINARY_URL as string);

import { transformCard, uploadImage } from '../helpers';

import { CardModel, EditionModel, EraModel, FrecuencyModel, ICard, IEdition, RaceModel, TypeModel } from '../models';


export const getCardsByEdition = async (req: Request, res: Response) => {

    try {

        const { id } = req.params;

        let conditionEdition: any = {
            id: new Types.ObjectId(id)
        };

        if (req.user.role === 'USER_ROLE') {
            conditionEdition.status = true;
        }

        const cards = await CardModel.find({ edition: new Types.ObjectId(id), status: true }).sort('num').populate({
            path: 'edition',
            match: conditionEdition
        });

        const newCards = cards.map(card => {
            return transformCard(card);
        });

        return res.status(200).json(newCards);
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: 'Por favor hable con el administrador'
        });
    }
}

export const postCard = async (req: Request, res: Response) => { 

    try {

        const { name, num, ability, legend, race, cost, strength, ...body } = req.body;

        let cardBody = {
            name: name.toUpperCase(),
            user: req.user._id,
            ...body
        };

        if (race !== 'undefined' && race) {
            cardBody.race = race;
        }

        if (num !== 'undefined' && num) {
            cardBody.num = num;
        }

        if (cost !== 'undefined' && cost) {
            cardBody.cost = cost.trim();
        }

        if (strength !== 'undefined' && strength) {
            cardBody.strength = strength.trim();
        }

        if (ability !== 'undefined' && ability) {
            cardBody.ability = ability.trim();
        }

        if (legend !== 'undefined' && legend) {
            cardBody.legend = legend.trim();
        }

        const card: ICard = new CardModel(cardBody);
        
        const editionDB = await EditionModel.findById(body.edition) as IEdition;

        const resp = await uploadImage(req.file?.buffer as Buffer, editionDB.name);
        card.img = resp.secure_url;

        await card.save();

        let cardResponse = await CardModel.findById(card.id)
        .populate('type', 'name')
        .populate('frecuency', 'name')
        .populate('edition', 'name')
        .populate('race', 'name')
        .populate('era', 'name')

        const response = transformCard(cardResponse as ICard);

        return res.status(201).json(response);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: 'Por favor hable con el administrador'
        });
    }
};

export const getCard = async (req: Request, res: Response) => { 

    try {

        const cards = await CardModel.find({})
        .populate('type', 'name')        
        .populate('frecuency', 'name')
        .populate('edition', 'name')
        .populate('race', 'name')
        .populate('era', 'name')

        const newCards = cards.map(card => {
            return transformCard(card);
        });

        return res.status(200).json(newCards);        

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: 'Por favor hable con el administrador'
        });
    }
};

export const getCardById = async (req: Request, res: Response) => { 

    try {

        const { id } = req.params;

        const card = await CardModel.findById(id)
        .populate('type', 'name')        
        .populate('frecuency', 'name')
        .populate('edition', 'name')
        .populate('race', 'name')
        .populate('era', 'name')

        const response = transformCard(card as ICard); 

        return res.status(200).json(response);        

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: 'Por favor hable con el administrador'
        });
    }
};

export const deleteCard = async (req: Request, res: Response) => {

    try {

        const { id } = req.params;

        const cardBD = await CardModel.findById(id);

        const img = cardBD?.img as string;
        const imgSplit = img.split('/');
        const fileName = imgSplit[imgSplit.length - 1];
        const [ publicId ] = fileName.split('.');
        await cloudinary.uploader.destroy(publicId);

        await CardModel.findByIdAndDelete(id, { new: true });

        return res.status(200).json({});  

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: 'Por favor hable con el administrador'
        });
    }
};

export const updateCard = async (req: Request, res: Response) => {

    try {

        const { id } = req.params;

        const cardBD = await CardModel.findById(id);

        const { name, num, ability, legend, type, era, edition, frecuency, race, cost, strength, ...body } = req.body;
        
        let cardBody = {
            name: name.toUpperCase(),
            user: req.user._id,
            ...body
        };

        if (req.file) {
            const img = cardBD?.img as string;
            const imgSplit = img.split('/');
            const fileName = imgSplit[imgSplit.length - 1];
            const [ publicId ] = fileName.split('.');
            await cloudinary.uploader.destroy(publicId);

            const resp = await uploadImage(req.file.buffer, edition);
            cardBody.img = resp.secure_url;
        }

        let typeId =  await TypeModel.findOne({ name: type });
        if (!typeId) {
            const type2 = await TypeModel.findById(type);
            typeId = type2?._id;
        }
        cardBody.type = typeId;

        let eraId =  await EraModel.findOne({ name: era });
        if (!eraId) {
            const era2 = await EraModel.findById(era);
            eraId = era2?._id;
        }
        cardBody.era = eraId;

        let editionId =  await EditionModel.findOne({ name: edition });
        if (!editionId) {
            const edition2 = await EditionModel.findById(edition);
            editionId = edition2?._id;
        }
        cardBody.edition = editionId;

        let frecuencyId = await FrecuencyModel.findOne({ name: frecuency }); 
        if (!frecuencyId) {
            const frecuency2 = await FrecuencyModel.findById(frecuency);
            frecuencyId = frecuency2?._id;
        }
        cardBody.frecuency = frecuencyId;

        if (race === 'undefined' || !race) {
            if (cardBD) {
                cardBD.race = undefined;
                await cardBD.save();
            }
        } else {
            let raceId = await RaceModel.findOne({ name: race }); 
            if (!raceId) {
                const race2 = await RaceModel.findById(race);
                raceId = race2?._id;
            }
            cardBody.race = raceId;
        }

        if (num === 'undefined' || !num) {
            if (cardBD) {
                cardBD.num = undefined;
                await cardBD.save();
            }
        } else {
            cardBody.num = num;
        }
        
        if (cost === 'undefined' || !cost) {
            if (cardBD) {
                cardBD.cost = undefined;
                await cardBD.save();
            }
        } else {
            cardBody.cost = cost.trim();
        }

        if (strength === 'undefined' || !strength) {
            if (cardBD) {
                cardBD.strength = undefined;
                await cardBD.save();
            }            
        } else {
            cardBody.strength = strength.trim();         
        }

        if (ability === 'undefined' || !ability) {
            if (cardBD) {
                cardBD.ability = undefined;
                await cardBD.save();
            }
        } else {
            cardBody.ability = ability.trim();
        }

        if (legend === 'undefined' || !legend) {
            if (cardBD) {
                cardBD.legend = undefined;
                await cardBD.save();
            }
        } else {
            cardBody.legend = legend.trim();
        }

        const cardUpdated = await CardModel.findByIdAndUpdate(id, cardBody, { new: true })
        .populate('type', 'name')        
        .populate('frecuency', 'name')
        .populate('edition', 'name')
        .populate('race', 'name')
        .populate('era', 'name');

        const response = transformCard(cardUpdated as ICard);

        return res.status(200).json(response);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: 'Por favor hable con el administrador'
        });
    }
};

export const patchCard = async (req: Request, res: Response) => {

    try {

        const { num, name, edition, era, id } = req.body;

        const cardBD = await CardModel.findOne({num, name: name.toUpperCase(), edition: new Types.ObjectId(edition), era: new Types.ObjectId(era)}) as ICard;
        //const cardBD = await CardModel.findById(id) as ICard;

        if (!cardBD) {
            return res.status(204).json({});
        }
        

        const file = req.file as Express.Multer.File;
        
        const editionDB = await EditionModel.findById(edition) as IEdition;
        const resp = await uploadImage(file.buffer, editionDB.name);
        //const resp = await uploadImage(file.buffer, edition);

        const cardUpdated = await CardModel.findByIdAndUpdate(cardBD?.id, {img: resp.secure_url}, { new: true })

        console.log(cardBD.id, cardBD.num, cardBD.name, edition, era)
        return res.status(200).json(cardUpdated);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: 'Por favor hable con el administrador'
        });
    }
};