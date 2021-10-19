import { Schema, model, Document, Model } from 'mongoose';

export interface IFrecuency extends Document{
    name: string;
};

const schema: Schema = new Schema({
    name: { 
        type: String, 
        required: [true, 'the "name" is required'] 
    }
});

schema.methods.toJSON = function () {

    const { __v, _id, ...frecuency } = this.toObject();
    frecuency.id = _id;
    return frecuency;

};

export const FrecuencyModel: Model<IFrecuency> = model<IFrecuency>('Frecuency', schema);