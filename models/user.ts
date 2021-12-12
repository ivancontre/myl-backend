import moment from 'moment';
import { Schema, model, Document, PopulatedDoc } from 'mongoose';
import { IDeck } from './deck';

export interface IUser extends Document {
    name: string;
    lastname: string;
    username: string;
    email: string;
    password: string;
    google?: boolean;
    role?: string;
    status?: boolean;
    verify?: boolean;
    online?: boolean;
    lastTimeOnline?: moment.Moment;
    playing?: boolean;
    lastTimePlaying?: moment.Moment;
    victories?: number;
    defeats?: number;
    decks:  PopulatedDoc<IDeck>[];
};

const schema = new Schema<IUser>({
    name: { 
        type: String, 
        required: true 
    },
    lastname: { 
        type: String, 
        required: true 
    },
    username: { 
        type: String, 
        required: true,
        unique: true
    },
    email: { 
        type: String, 
        required: true,
        unique: true
    },
    password: { 
        type: String, 
        required: true 
    },
    google: { 
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        default: 'USER_ROLE',
        //enum: ['ADMIN_ROLE', 'USER_ROLE']
    },
    status: {
        type: Boolean,
        default: process.env.STATUS_REGISTER === 'true'
    },
    lastTimeOnline: { 
        type: Date,
        default: undefined
    },
    online: { 
        type: Boolean,
        default: false
    },
    verify: { 
        type: Boolean,
        default: false
    },
    playing: { 
        type: Boolean,
        default: false
    },
    lastTimePlaying: { 
        type: Date,
        default: undefined
    },
    victories: { 
        type: Number,
        default: 0
    },
    defeats: {
        type: Number,
        default: 0
    },
    decks: [{
        type: Schema.Types.ObjectId,
        ref: 'Deck'
    }]
}, {
    timestamps: true
});

schema.methods.toJSON = function () {

    const { __v, _id, password, ...user } = this.toObject();
    user.id = _id;
    return user;

};

export const UserModel = model<IUser>('User', schema);