import { NextFunction, Request, Response} from 'express';
import { DeckModel, IDeck, UserModel } from '../models';
import { v4 as uuid } from 'uuid';
import { transformCard } from '../helpers';

export const postDeck = async (req: Request, res: Response, next: NextFunction) => {

    try {

        const user = await UserModel.findById(req.user._id);

        if (user) {

            if (user.decks.length >= Number(process.env.MAX_NUMBER_DECKS)) {
                return res.status(400).json({
                    msg: `No puede crear más de ${process.env.MAX_NUMBER_DECKS} mazos`
                });
            }

            let data = {
                ...req.body,
                user: req.user._id,
            };

            
            if (user.decks.length === 0) {

                if (data.cards.length === 50) {
                    data.byDefault = true;
                }
                
            }

            const deck: IDeck = new DeckModel(data);

            const deckSaved = await deck.save();

            user.decks = user.decks.concat(deckSaved);
            await user.save();

            res.status(201).json(deckSaved);

            if (data.byDefault) {
                next();
            }

        } else {
            return res.status(204).json({});
        }
        
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
                    return transformCard(card, req.user._id);
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

export const deleteDeck = async (req: Request, res: Response, next: NextFunction) => {    

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

        res.status(200).json(deck);
        next();
        
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

        const deckSaved = await DeckModel.findByIdAndUpdate(id, body, { new: true }).populate('cards');

        const user = await UserModel.findById(req.user._id);

        if (user){
            user.decks = user.decks.map(
                (e: IDeck) => (e.id === deckSaved?.id) ? deckSaved : e
            )
            await user.save();
        }

        const newDeckSaved = {
            id: deckSaved?.id,
            name: deckSaved?.name,
            user: deckSaved?.user,
            byDefault: deckSaved?.byDefault,
            cards: deckSaved?.cards.map(card => {
                return transformCard(card, req.user._id);
            })
        }

        return res.status(200).json(newDeckSaved);
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: 'Por favor hable con el administrador'
        });
    }

};

export const patchDeck = async (req: Request, res: Response, next: NextFunction) => {    

    try {

        const { id } = req.params;       
        
        const { isDefault } = req.body;


        const user = await UserModel.findById(req.user._id);

        if (user) {

            for (const deck of user.decks) {
                const deckId = deck.toString();

                if (deckId == id ) {
                    await DeckModel.findByIdAndUpdate(id, { byDefault: isDefault }, { new: true });
                } else {
                    await DeckModel.findByIdAndUpdate(deckId, { byDefault: false }, { new: true });
                }                
            }

        }
        
        res.status(200).json({});
        next();
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: 'Por favor hable con el administrador'
        });
    }

};