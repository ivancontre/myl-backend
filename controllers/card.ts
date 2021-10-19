import { Request, Response} from 'express';
import { UploadedFile } from 'express-fileupload';
import { uploadImage } from '../helpers/uploadImage';

import { CardModel, ICard } from '../models';

export const postCard = async (req: Request, res: Response) => { 

    try {

        const { name, ...body } = req.body;

        const cardDB = await CardModel.findOne({ name: name.toUpperCase() });

        if (cardDB) {
            return res.status(400).json({
                msg: `La carta ${ cardDB.name } ya existe`
            });
        }

        const card: ICard = new CardModel({
            name: name.toUpperCase(),
            user: req.user._id,
            ...body
        });
        
        const resp = await uploadImage(req.file.buffer);
        card.img = resp.secure_url

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
            race: cardResponse?.race.name,
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
                race: card.race.name,
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
            type: card?.type.name,
            frecuency: card?.frecuency.name,
            edition: card?.edition.name,
            race: card?.race.name,
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