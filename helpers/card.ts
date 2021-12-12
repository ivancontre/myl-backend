import { v4 as uuid } from 'uuid';
import { ICard } from "../models";

export const transformCard = (card: ICard, userId?: string) => {

    const width = process.env.CLOUDINARY_W_IMAGE as string;

    let output: Partial<ICard> & { idx?: string; } = {
        id: card.id,
        num: card.num,
        name: card.name,
        ability: card.ability,
        legend: card.legend,
        type: card.type.name,
        frecuency: card.frecuency.name,
        edition: card.edition.name,
        race: card.race?.name,
        cost: card.cost,
        strength: card.strength,
        isMachinery: card.isMachinery,
        user: !userId ? card.user : userId,
        img: width ? card.img?.replace('upload/', `upload/w_${width},f_auto/`) : card.img,
        isUnique: card.isUnique
    };

    if (userId) output.idx = uuid();

    return output;
    
};