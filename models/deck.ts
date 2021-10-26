import { Schema, model, Document, Model, PopulatedDoc } from 'mongoose';
import { ICard, IUser } from '.';

export interface IDeck extends Document{
    name: string;
    user: PopulatedDoc<IUser>;
    cards: PopulatedDoc<ICard>[];
    byDefault?: boolean;
};

const schema: Schema = new Schema({
    name: { 
        type: String, 
        required: [true, 'the "name" is required'] 
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    cards: [{
        type: Schema.Types.ObjectId,
        ref: 'Card',
        required: true
    }],
    byDefault: {
        type: Boolean, 
        default: false
    }
}, {
    timestamps: true
});

schema.methods.toJSON = function () {

    const { __v, _id, ...deck } = this.toObject();
    deck.id = _id;
    return deck;

};

export const DeckModel: Model<IDeck> = model<IDeck>('Deck', schema);