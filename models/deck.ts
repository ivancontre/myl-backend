import { Schema, model, Document, Model, PopulatedDoc } from 'mongoose';
import { ICard, IUser, IEra } from '.';
import { IEdition } from './edition';

export interface IDeck extends Document{
    name: string;
    user?: PopulatedDoc<IUser>;
    cards: PopulatedDoc<ICard>[];
    era?: PopulatedDoc<IEra>;
    byDefault?: boolean;
    edition?: PopulatedDoc<IEdition>;
};

const schema: Schema = new Schema({
    name: { 
        type: String, 
        required: [true, 'the "name" is required'] 
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: undefined
    },
    cards: [{
        type: Schema.Types.ObjectId,
        ref: 'Card',
        required: true
    }],
    era: { 
        type: Schema.Types.ObjectId,
        ref: 'Era',
        default: undefined
    },
    byDefault: {
        type: Boolean, 
        default: false
    },
    edition: { 
        type: Schema.Types.ObjectId,
        ref: 'Edition',
        default: undefined
    },
}, {
    timestamps: true
});

schema.methods.toJSON = function () {

    const { __v, _id, ...deck } = this.toObject();
    deck.id = _id;
    return deck;

};

export const DeckModel: Model<IDeck> = model<IDeck>('Deck', schema);