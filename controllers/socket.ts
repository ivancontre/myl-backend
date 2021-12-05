import { DeckModel, IDeck, UserModel } from "../models"

export const userConnected = async (id: string) => {
    const user = await UserModel.findById(id);

    if (user) {
        user.online = true;
        await user.save();

        return user;
    }
};

export const userDisconnected = async (id: string) => {
    const user = await UserModel.findById(id);

    if (user) {
        user.online = false;
        await user.save();

        return user;
    }
};


export const getUsers = async () => {
    const user = await UserModel
    .find()
    .sort('-online').populate('decks');

    return user;
};

export const getUser = async (id: string) => {
    const user = await UserModel.findById(id);

    return user;
};

export const setPlaying = async (id: string, status: boolean) => {
    const user = await UserModel.findByIdAndUpdate(id, { playing: status }, { new: true });
    return user;
};

export const setResults = async (id: string, win: boolean) => {
    if (win) {
        await UserModel.findByIdAndUpdate(id, {$inc: { victories: 1} }, { new: true });
    } else {
        await UserModel.findByIdAndUpdate(id, {$inc: { defeats: 1} }, { new: true });
    }
};

export const deleteDeckSocket = async (deckId: string, userId: string) => {

    await DeckModel.findByIdAndDelete(deckId, { new: true });

    const user = await UserModel.findById(userId);

    if (user){
        user.decks = user.decks.filter((e: IDeck) => {

            if (e._id.toString() !== deckId) {
                return true
            }
        });
        
        await user.save();

        // si se queda con 0 mazos entonces se debe actualizar el listado a todos
    }

};

// export const createDeckSocket = async (deckId: string, userId: string) => {

//     const user = await UserModel.findById(userId);

//     if (user) {

//         let data = {
//             ...req.body,
//             user: req.user._id,
//         };

//         if (user.decks.length === 0) {
//             data.byDefault = true;
//         }

//         const deck: IDeck = new DeckModel(data);

//         const deckSaved = await deck.save();

//         user.decks = user.decks.concat(deckSaved);
//         await user.save();

//         return res.status(201).json(deckSaved);

//     }
// };
