import { Request, Response} from 'express';
import { Types } from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
cloudinary.config(process.env.CLOUDINARY_URL as string);

import { transformCard, uploadImage } from '../helpers';

import { CardModel, EditionModel, FrecuencyModel, ICard, RaceModel, TypeModel } from '../models';


export const getCardsByEdition = async (req: Request, res: Response) => {

    try {

        const { id } = req.params;
        
        const cards = await CardModel.find({ edition: new Types.ObjectId(id) });

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

        const { name, ability, legend, ...body } = req.body;

        const cardDB = await CardModel.findOne({ name: name.toUpperCase() });

        if (cardDB) {
            return res.status(400).json({
                msg: `La carta ${ cardDB.name } ya existe`
            });
        }

        let cardBody = {
            name: name.toUpperCase(),
            user: req.user._id,
            ...body
        };

        if (ability) cardBody.ability = ability.trim();
        if (legend) cardBody.legend = legend.trim();

        const card: ICard = new CardModel(cardBody);
        
        const resp = await uploadImage(req.file?.buffer as Buffer);
        card.img = resp.secure_url;

        await card.save();

        let cardResponse = await CardModel.findById(card.id)
        .populate('type', 'name')
        .populate('frecuency', 'name')
        .populate('edition', 'name')
        .populate('race', 'name');

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

        const cards = await CardModel.find()
        .populate('type', 'name')        
        .populate('frecuency', 'name')
        .populate('edition', 'name')
        .populate('race', 'name')

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

        const response = transformCard(card as ICard); 

        return res.status(200).json(response);        

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

        const { name, ability, legend, type, edition, frecuency, race, ...body } = req.body;

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

            const resp = await uploadImage(req.file.buffer);
            cardBody.img = resp.secure_url;
        }

        let typeId =  await TypeModel.findOne({ name: type });
        if (!typeId) {
            const type2 = await TypeModel.findById(type);
            typeId = type2?._id;
        }
        cardBody.type = typeId;

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

        if (race) {
            let raceId = await RaceModel.findOne({ name: race }); 
            if (!raceId) {
                const race2 = await RaceModel.findById(race);
                raceId = race2?._id;
            }
            cardBody.race = raceId;
        }        

        if (ability) cardBody.ability = ability.trim();
        if (legend) cardBody.legend = legend.trim();

        const cardUpdated = await CardModel.findByIdAndUpdate(id, cardBody, { new: true })
        .populate('type', 'name')        
        .populate('frecuency', 'name')
        .populate('edition', 'name')
        .populate('race', 'name');

        const response = transformCard(cardUpdated as ICard);

        return res.status(200).json(response);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: 'Por favor hable con el administrador'
        });
    }
};