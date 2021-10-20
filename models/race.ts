import { Schema, model, Document, Model, PopulatedDoc } from 'mongoose';
import { IEdition } from '.';

export interface IRace extends Document{
    name: string;
    edition: PopulatedDoc<IEdition>;
};

const schema: Schema = new Schema({
    name: { 
        type: String, 
        required: [true, 'the "name" is required'] 
    },
    edition: { 
        type: Schema.Types.ObjectId,
        ref: 'Edition',
        required: true
    }
});

schema.methods.toJSON = function () {

    const { __v, _id, ...race } = this.toObject();
    race.id = _id;
    return race;

};

export const RaceModel: Model<IRace> = model<IRace>('Race', schema);