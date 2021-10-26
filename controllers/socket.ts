import { UserModel } from "../models"

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