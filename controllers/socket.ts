import moment from "moment";
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
    return await UserModel.findByIdAndUpdate(id, { playing: status }, { new: true });
};

export const setResults = async (id: string, win: boolean) => {
    if (win) {
        return await UserModel.findByIdAndUpdate(id, {$inc: { victories: 1} }, { new: true });
    } else {
        return await UserModel.findByIdAndUpdate(id, {$inc: { defeats: 1} }, { new: true });
    }
};

export const setLastTimePlaying = async (id: string) => {
    await UserModel.findByIdAndUpdate(id, { lastTimePlaying: moment() }, { new: true });
};

export const setLastTimeOnline = async (id: string) => {
    await UserModel.findByIdAndUpdate(id, { lastTimeOnline: moment() }, { new: true });
};