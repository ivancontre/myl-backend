import { Schema, model, Document, Model, PopulatedDoc } from 'mongoose';
import { IEdition } from '.';

export interface IEra extends Document{
    name: string;
    editions: PopulatedDoc<IEdition>[];
    status: boolean;
};

const schema: Schema = new Schema({
    name: { 
        type: String, 
        required: [true, 'the "name" is required'] 
    },
    editions: [{
        type: Schema.Types.ObjectId,
        ref: 'Edition',
        required: true
    }],
    status: { 
        type: Boolean,
        default: true
    },
});

schema.methods.toJSON = function () {

    const { __v, _id, ...era } = this.toObject();
    era.id = _id;
    return era;

};

export const EraModel: Model<IEra> = model<IEra>('Era', schema);