import { Schema, model, Document, Model, PopulatedDoc } from 'mongoose';
import { IEra, IRace } from '.';

export interface IEdition extends Document{
    name: string;
    races: PopulatedDoc<IRace>[];
    era: PopulatedDoc<IEra>;
    status: boolean;
};

const schema: Schema = new Schema({
    name: { 
        type: String, 
        required: [true, 'the "name" is required'] 
    },
    races: [{
        type: Schema.Types.ObjectId,
        ref: 'Race',
        required: true
    }],
    era: { 
        type: Schema.Types.ObjectId,
        ref: 'Era',
        required: true
    },
    status: { 
        type: Boolean,
        default: true
    }

});

schema.methods.toJSON = function () {

    const { __v, _id, ...edition } = this.toObject();
    edition.id = _id;
    return edition;

};

export const EditionModel: Model<IEdition> = model<IEdition>('Edition', schema);