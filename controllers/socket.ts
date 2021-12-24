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
    const users = await UserModel
    .find()
    .sort('-online').populate({
        path: 'decks',
        populate: {
            path: 'era',
            model: 'Era'
        }
    });

    const newUsers = users.map(user => {
        return {
            id: user.id,
            name: user.name,
            lastname: user.lastname,
            username: user.username,
            email: user.email,
            google: user.google,
            role: user.role,
            status: user.status,
            online: user.online,
            verify: user.verify,
            playing: user.playing,
            victories: user.victories,
            defeats: user.defeats,
            lastTimePlaying: user.lastTimePlaying,
            lastTimeOnline: user.lastTimeOnline,
            era: user.decks.find(deck => deck.byDefault === true) ? user.decks.find(deck => deck.byDefault === true).era?.name : '',
            decks: user.decks.length,
            defaultDeck: user.decks?.find(deck => deck.byDefault === true) ? true : false
            
        }
    })

    return newUsers;
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