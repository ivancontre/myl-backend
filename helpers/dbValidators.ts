import { UserModel, RoleModel, RaceModel, EditionModel, CardModel, DeckModel } from "../models";
import { FrecuencyModel } from "../models";
import { TypeModel } from "../models";

export const existsEmail = async (email: string) => {

    const userExists = await UserModel.findOne({ email });

    if (userExists) {
        throw new Error(`El email "${ email }" ya se encuentra registrado en la BD`);
    }

    return true;
};

export const existsUserByName = async (username: string) => {

    const userExists = await UserModel.findOne({ username });

    if (userExists) {
        throw new Error(`El usuario "${ username }" ya se encuentra registrado en la BD`);
    }

    return true;
};

export const existsUser = async (id: string) => {

    const userExists = await UserModel.findById(id);

    if (!userExists) {
        throw new Error(`El ID "${ id }" de usuario no existe`);
    }

    return true;
};

export const isValidRole = async (name: string) => {

    const roleExists = await RoleModel.findOne({ name });

    if (!roleExists) {
        throw new Error(`El rol "${ name }"" no está registrado en la BD`);
    }

    return true;

};

export const existsCardNumber = async (num: number) => {

    const cardExists = await CardModel.findOne({ num });

    if (cardExists) {
        throw new Error(`El número de carta "${ num }" ya se encuentra registrado en la BD`);
    }

    return true;
};

export const isValidType = async (id: string) => {

    const typeExists = await TypeModel.findById(id);

    if (!typeExists) {
        throw new Error(`El tipo "${ id }"" no está registrado en la BD`);
    }

    return true;

};

export const isValidFrecuency = async (id: string) => {

    const frecuencyExists = await FrecuencyModel.findById(id);

    if (!frecuencyExists) {
        throw new Error(`La frecuencia "${ id }"" no está registrada en la BD`);
    }

    return true;

};

export const isValidRace = async (id: string) => {

    const raceExists = await RaceModel.findById(id);

    if (!raceExists) {
        throw new Error(`La raza "${ id }"" no está registrada en la BD`);
    }

    return true;

};

export const isValidEdition = async (id: string) => {

    const editionExists = await EditionModel.findById(id);

    if (!editionExists) {
        throw new Error(`La edición "${ id }"" no está registrada en la BD`);
    }

    return true;

};

export const existsDeck = async (id: string) => {
    const deckExists = await DeckModel.findById(id);

    if (!deckExists) {
        throw new Error(`El ID "${ id }" de mazo no existe`);
    }

    return true;
};