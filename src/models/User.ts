import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser {
    name: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
    updatedAt: Date;
}


export interface IUserDocument extends IUser, Document {
    password?: string;
    _password?: string;
    comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUserDocument>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        passwordHash: {
            type: String,
            required: false,
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform(doc, ret) {
                delete ret.passwordHash;
                return ret;
            },
        },
    }
);

UserSchema.virtual('password')
    .set(function (this: IUserDocument, plain: string) {
        this._password = plain;
    })
    .get(function (this: IUserDocument) {
        return this._password;
    });

UserSchema.pre<IUserDocument>('save', async function () {
    if (this._password) {
        const saltRounds = 10;
        this.passwordHash = await bcrypt.hash(this._password, saltRounds);
    }
});

UserSchema.methods.comparePassword = function (
    this: IUserDocument,
    candidate: string
): Promise<boolean> {
    return bcrypt.compare(candidate, this.passwordHash);
};

export const User = model<IUserDocument>('User', UserSchema);
