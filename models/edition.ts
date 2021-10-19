import { Schema, model, Document, Model } from 'mongoose';

export interface IEdition extends Document{
    name: string;
};

const schema: Schema = new Schema({
    name: { 
        type: String, 
        required: [true, 'the "name" is required'] 
    }
});

schema.methods.toJSON = function () {

    const { __v, _id, ...edition } = this.toObject();
    edition.id = _id;
    return edition;

};

export const EditionModel: Model<IEdition> = model<IEdition>('Edition', schema);