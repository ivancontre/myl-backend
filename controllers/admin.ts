import { NextFunction, Request, Response } from "express";
import { DeckModel, UserModel } from "../models";

export const patchBooloeansUser = async (req: Request, res: Response, next: NextFunction) => {

    try {

        const { id } = req.params;       
        
        const { key, value } = req.body;

        let body: any = {};
        body[key] = value;

        await UserModel.findByIdAndUpdate(id, body, { new: true });

        res.status(200);

        next();

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: 'Por favor hable con el administrador'
        });
    }

};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {

    try {

        const { id } = req.params;

        const userToDelete = await UserModel.findById(id);

        if (userToDelete?.decks.length) {
            for (const deckId of userToDelete?.decks) {
                await DeckModel.findByIdAndDelete(deckId, { new: true });
            }
        }

        await UserModel.findByIdAndDelete(id, { new: true });

        res.status(200);

        next();

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: 'Por favor hable con el administrador'
        });
    }

};