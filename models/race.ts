import { Schema, model, Document, Model } from 'mongoose';

export interface IRace extends Document{
    name: string;
};

const schema: Schema = new Schema({
    name: { 
        type: String, 
        required: [true, 'the "name" is required'] 
    }
});

schema.methods.toJSON = function () {

    const { __v, _id, ...race } = this.toObject();
    race.id = _id;
    return race;

};

export const RaceModel: Model<IRace> = model<IRace>('Race', schema);