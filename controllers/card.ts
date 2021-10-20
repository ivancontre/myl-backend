import { Request, Response} from 'express';
import { UploadedFile } from 'express-fileupload';
import { uploadImage } from '../helpers/uploadImage';

import { CardModel, EditionModel, FrecuencyModel, ICard, RaceModel, TypeModel } from '../models';

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
        
        const resp = await uploadImage(req.file.buffer);
        card.img = resp.secure_url;

        await card.save();

        let cardResponse = await CardModel.findById(card.id)
        .populate('type', 'name')
        .populate('frecuency', 'name')
        .populate('edition', 'name')
        .populate('race', 'name');

        const response = {
            id: cardResponse?.id,
            num: cardResponse?.num,
            name: cardResponse?.name,
            ability: cardResponse?.ability,
            legend: cardResponse?.legend,
            type: cardResponse?.type.name,
            frecuency: cardResponse?.frecuency.name,
            edition: cardResponse?.edition.name,
            race: cardResponse?.race?.name,
            cost: cardResponse?.cost,
            strength: cardResponse?.strength,
            isMachinery: cardResponse?.isMachinery,
            user: cardResponse?.user,
            img: cardResponse?.img,
            isUnique: cardResponse?.isUnique
        };

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

            return {
                id: card.id,
                num: card.num,
                name: card.name,
                ability: card.ability,
                legend: card.legend,
                type: card.type.name,
                frecuency: card.frecuency.name,
                edition: card.edition.name,
                race: card.race?.name,
                cost: card.cost,
                strength: card.strength,
                isMachinery: card.isMachinery,
                user: card.user,
                img: card.img,
                isUnique: card.isUnique

            }

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

        const response = {
            id: card?.id,
            num: card?.num,
            name: card?.name,
            ability: card?.ability,
            legend: card?.legend,
            type: card?.type.id,
            frecuency: card?.frecuency.id,
            edition: card?.edition.id,
            race: card?.race?.id,
            cost: card?.cost,
            strength: card?.strength,
            isMachinery: card?.isMachinery,
            user: card?.user,
            img: card?.img,
            isUnique: card?.isUnique
        };  

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

        if (!cardBD) {
            return res.status(400).json({
                msg: `La carta no existe con el id ${id}`
            });
        }

        if (req.file) {
            // eliminar la que se encuenra en cloudinary y subir la nueva
        }

        const { name, ability, legend, type, edition, frecuency, race, ...body } = req.body;


        let cardBody = {
            name: name.toUpperCase(),
            user: req.user._id,
            ...body
        };

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

        const response = {
            id: cardUpdated?.id,
            num: cardUpdated?.num,
            name: cardUpdated?.name,
            ability: cardUpdated?.ability,
            legend: cardUpdated?.legend,
            type: cardUpdated?.type.name,
            frecuency: cardUpdated?.frecuency.name,
            edition: cardUpdated?.edition.name,
            race: cardUpdated?.race?.name,
            cost: cardUpdated?.cost,
            strength: cardUpdated?.strength,
            isMachinery: cardUpdated?.isMachinery,
            user: cardUpdated?.user,
            img: cardUpdated?.img,
            isUnique: cardUpdated?.isUnique
        };

        return res.status(200).json(response);        

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: 'Por favor hable con el administrador'
        });
    }
};