import { Schema, model, Document, Model } from 'mongoose';

export interface IType extends Document {
    name: string;
};

const schema: Schema = new Schema({
    name: { 
        type: String, 
        required: [true, 'the "name" is required'] 
    }
});

schema.methods.toJSON = function () {

    const { __v, _id, ...type } = this.toObject();
    type.id = _id;
    return type;

};

export const TypeModel: Model<IType> = model<IType>('Type', schema);