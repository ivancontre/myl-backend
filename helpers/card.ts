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
        type: card.type.name ? card.type.name : card.type,
        frecuency: card.frecuency.name ? card.frecuency.name : card.frecuency,
        edition: card.edition.name ? card.edition.name : card.edition,
        era: card.era.name ? card.era.name : card.era,
        race: card.race?.name ? card.race?.name : card.race,
        cost: card.cost,
        strength: card.strength,
        isMachinery: card.isMachinery,
        user: !userId ? card.user : userId,
        img: card.img,
        isUnique: card.isUnique,
        status: card.status
    };

    if (userId) output.idx = uuid();

    return output;
    
};