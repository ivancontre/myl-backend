import { Schema, model, Document, PopulatedDoc } from 'mongoose';
import { IUser } from '.';
import { IEdition } from './edition';
import { IFrecuency } from './frecuency';
import { IRace } from './race';
import { IType } from './type';

export interface ICard extends Document {
    num: number;
    name: string;
    ability?: string;
    legend?: string;
    type: PopulatedDoc<IType>;
    frecuency: PopulatedDoc<IFrecuency>;
    race?: PopulatedDoc<IRace>;
    edition: PopulatedDoc<IEdition>;
    user: PopulatedDoc<IUser>;
    cost?: number;
    strength?: number;
    isMachinery?: boolean;
    img?: string;
    isUnique?: boolean;
    
};

const schema = new Schema<ICard>({
    num: {
        type: Number,
        required: true,
        unique: true
    },
    name: { 
        type: String, 
        required: true 
    },
    ability: { 
        type: String, 
        default: undefined
    },
    legend: { 
        type: String, 
        default: undefined
    },
    type: { 
        type: Schema.Types.ObjectId,
        ref: 'Type',
        required: true
    },
    frecuency: { 
        type: Schema.Types.ObjectId,
        ref: 'Frecuency',
        required: true
    },
    race: { 
        type: Schema.Types.ObjectId,
        ref: 'Race'
    },
    edition: { 
        type: Schema.Types.ObjectId,
        ref: 'Edition',
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    cost: {
        type: Number,
        default: undefined
    },
    strength: {
        type: Number,
        default: undefined
    },
    isMachinery: { 
        type: Boolean,
        default: false
    },
    img: { 
        type: String,
        default: ''
    },
    isUnique: { 
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

schema.methods.toJSON = function () {

    const { __v, _id, ...card } = this.toObject();
    card.id = _id;
    return card;

};

export const CardModel = model<ICard>('Card', schema);