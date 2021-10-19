import { Schema, model, Document, Model } from 'mongoose';

export interface IRole extends Document{
    name: string;
};

const schema: Schema = new Schema({
    name: { 
        type: String, 
        required: [true, 'the "name" is required'] 
    }
});

export const RoleModel: Model<IRole> = model<IRole>('Role', schema);