import {Schema, Types, Document, model} from "mongoose";

export interface IRefreshToken {
    user: Types.ObjectId;
    token: string;
    expiresAt: Date;
    revokedAt?: Date
    revokedReason?: string;
    ipAddress?: string;
    userAgent?: string;
}

export interface IRefreshTokenDocument extends IRefreshToken, Document  {
    isExpired(): boolean;
    isActive(): boolean;
}

const RefreshTokenSchema = new Schema<IRefreshTokenDocument>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        token: { type: String, required: true, unique: true },
        expiresAt: { type: Date, required: true },
        revokedAt: { type: Date },
        revokedReason: { type: String },
        ipAddress: { type: String },
        userAgent: { type: String },
    }, { timestamps: { createdAt: true, updatedAt: false } });

RefreshTokenSchema.methods.isExpired = function() {
    return Date.now() > this.expiresAt.getTime();
};

RefreshTokenSchema.methods.isActive = function() {
    return !this.revokedAt && !this.isExpired();
};

export const RefreshToken = model<IRefreshTokenDocument>('RefreshToken', RefreshTokenSchema);