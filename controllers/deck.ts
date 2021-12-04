import { Request, Response} from 'express';
import { DeckModel, IDeck, UserModel } from '../models';
import { v4 as uuid } from 'uuid';
import { Types } from 'mongoose';

export const postDeck = async (req: Request, res: Response) => {

    try {

        const user = await UserModel.findById(req.user._id);

        if (user) {

            let data = {
                ...req.body,
                user: req.user._id,
            };

            if (user.decks.length === 0) {
                data.byDefault = true;
            }

            const deck: IDeck = new DeckModel(data);

            const deckSaved = await deck.save();

            user.decks = user.decks.concat(deckSaved);
            await user.save();

            return res.status(201).json(deckSaved);

        }
        
        return res.status(204).json({});

        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: 'Por favor hable con el administrador'
        });
    }
};

export const getDecks = async (req: Request, res: Response) => {

    try {

        const decks = await DeckModel.find({user: req.user._id})
        .populate('cards');

        const newDecks = decks.map(deck => {
            return {
                id: deck.id,
                name: deck.name,
                user: deck.user,
                byDefault: deck.byDefault,
                cards: deck.cards.map(card => {
                    return {
                        id: card.id,
                        idx: uuid(),
                        num: card.num,
                        name: card.name,
                        ability: card.ability,
                        legend: card.legend,
                        type: card.type,
                        frecuency: card.frecuency,
                        edition: card.edition,
                        race: card.race,
                        cost: card.cost,
                        strength: card.strength,
                        isMachinery: card.isMachinery,
                        user: req.user._id,
                        img: card.img,
                        isUnique: card.isUnique
                    }
                })
            }
        });

        return res.status(200).json(newDecks);
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: 'Por favor hable con el administrador'
        });
    }

};

export const deleteDeck = async (req: Request, res: Response) => {    

    try {

        const { id } = req.params;

        const deck = await DeckModel.findByIdAndDelete(id, { new: true });

        const user = await UserModel.findById(req.user._id);

        if (user){
            user.decks = user.decks.filter((e: IDeck) => {

                if (e._id.toString() !== id) {
                    return true
                }
            });
            
            await user.save();
        }

        return res.status(200).json(deck);
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: 'Por favor hable con el administrador'
        });
    }

};

export const updateDeck = async (req: Request, res: Response) => {    

    try {

        const { id } = req.params;


        const body = {
            ...req.body,
            user: req.user._id
        };

        const deckSaved = await DeckModel.findByIdAndUpdate(id, body, { new: true });

        const user = await UserModel.findById(req.user._id);

        if (user){
            user.decks = user.decks.map(
                (e: IDeck) => (e.id === deckSaved?.id) ? deckSaved : e
            )
            await user.save();
        }

        return res.status(200).json(deckSaved);
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: 'Por favor hable con el administrador'
        });
    }

};

export const patchDeck = async (req: Request, res: Response) => {    

    try {

        const { id } = req.params;        

        const user = await UserModel.findById(req.user._id);

        if (user) {

            for (const deck of user.decks) {
                const deckId = deck.toString();

                if (deckId == id ) {
                    await DeckModel.findByIdAndUpdate(id, { byDefault: true }, { new: true });
                } else {
                    await DeckModel.findByIdAndUpdate(deckId, { byDefault: false }, { new: true });
                }                
            }

        }

        return res.status(200).json({});
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: 'Por favor hable con el administrador'
        });
    }

};