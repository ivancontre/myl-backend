import { Request, Response} from 'express';
import { DeckModel, IDeck, UserModel } from '../models';

export const postDeck = async (req: Request, res: Response) => {

    try {

        const deck: IDeck = new DeckModel({
            ...req.body,
            user: req.user._id,
        });

        const deckSaved = await deck.save();

        const user = await UserModel.findById(req.user._id);

        if (user){
            user.decks = user.decks.concat(deckSaved);
            await user.save();
        }
        
        return res.status(201).json(deckSaved);

        
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
        
        return res.status(200).json(decks);
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: 'Por favor hable con el administrador'
        });
    }

}