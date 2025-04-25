import {IUserDocument, User} from "../models/User";
import createError from "http-errors";
import jwt from "jsonwebtoken";
import {IRefreshTokenDocument, RefreshToken} from "../models/RefreshToken";
import crypto from "crypto";

import type { SignOptions, Secret} from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN!;
const REFRESH_TOKEN_TTL = parseInt(process.env.REFRESH_TOKEN_TTL || ('1209600')); // in seconds

export class AuthService {

    static getRefreshTokenTTL(): number {
        return REFRESH_TOKEN_TTL;
    }

    static generateAccessToken(user: IUserDocument): string {
        const options: SignOptions = {expiresIn: JWT_EXPIRES_IN as SignOptions['expiresIn']};

        return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET as Secret, options);
    }

    static async createRefreshToken(user: IUserDocument, ipAddress?: string, userAgent?: string): Promise<IRefreshTokenDocument> {
        const token = crypto.randomBytes(40).toString("hex");
        const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL * 1000);
        const refresh = new RefreshToken({ user: user._id, token, expiresAt, ipAddress, userAgent});
        await refresh.save();
        return refresh;
    }

    static async register(name: string, email: string, password: string): Promise<IUserDocument> {
        const exists = await User.findOne({ email });
        if (exists) {
            throw createError(409, "User already exists");
        }
        const user = new User({ name, email });
        user.password = password;
        await user.save();
        return user;
    }

    static async login(email: string, password: string, ipAddress?: string, userAgent?: string): Promise<{user: IUserDocument; accessToken: string, refreshToken: string}> {
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            throw createError(401, "Wrong email or password");
        }
        const accessToken = this.generateAccessToken(user);
        const refreshTokenDoc = await this.createRefreshToken(user, ipAddress, userAgent);
        return { user, accessToken, refreshToken: refreshTokenDoc.token};
    }

    static async logout(token: string): Promise<void> {
        const existing = await RefreshToken.findOne({ token });
        if (existing && existing.isActive()) {
            existing.revokedAt = new Date();
            existing.revokedReason = 'user logout';
            await existing.save();
        }
    }

    static async refreshToken(oldToken: string, ipAddress?: string, userAgent?: string): Promise<{accessToken: string; refreshToken: string}> {
        const existing = await RefreshToken.findOne({ token: oldToken });
        console.log(oldToken);
        if(!existing || !existing.isActive()) {
            throw createError(401, "Wrong or expired refresh token");
        }

        existing.revokedAt = new Date();
        await existing.save();

        const user = await User.findById(existing.user);
        if (!user) throw createError(404, 'User not found');

        const accessToken = this.generateAccessToken(user);
        const newRefreshToken = await this.createRefreshToken(user, ipAddress, userAgent);

        return { accessToken, refreshToken: newRefreshToken.token };
    }
}