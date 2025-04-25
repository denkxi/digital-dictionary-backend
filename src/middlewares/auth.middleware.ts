import {Response, Request, NextFunction} from "express";
import createError from "http-errors";
import jwt from "jsonwebtoken";
import {IRefreshTokenDocument, RefreshToken} from "../models/RefreshToken";

const JWT_SECRET = process.env.JWT_SECRET!;

export interface TokenPayload {
    sub: string;
    email: string;
    iat?: number;
    exp?: number;
}

declare global {
    namespace Express {
        interface Request {
            user?: { id: string, email: string},
            token?: string;
            refreshDoc?: IRefreshTokenDocument;
        }
    }
}

export function authenticateAccessToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if(!authHeader?.startsWith('Bearer ')) {
        return next(createError(401, 'Access token is missing'));
    }

    const token = authHeader.split(' ')[1];
    try {
        const payload = jwt.verify(token, JWT_SECRET) as TokenPayload;
        req.user = { id: payload.sub, email: payload.email };
        next();
    }
    catch(error) {
        next(createError(401, 'Invalid or expired access token'));
    }
}

export function requireRefreshToken(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies.refreshToken;
    if(!token){
        return next(createError(401, 'Refresh token is missing'));
    }
    req.token = token;
    next();
}

export async function verifyRefreshTokenMetadata(req: Request, res: Response, next: NextFunction) {
    const token = req.token!;
    const existing = await RefreshToken.findOne({token});
    if (!existing || !existing.isActive()) {
        return next(createError(401, 'Invalid or expired refresh token'));
    }

    const ip = req.ip;
    const ua = req.get('User-Agent') || '';
    if(existing.ipAddress !== ip || existing.userAgent !== ua){
        existing.revokedAt = new Date();
        existing.revokedReason = 'metadata mismatch';
        await existing.save();
        return next(createError(401, `Refresh token metadata mismatch, ip: ${ip}, userAgent: ${ua}`));
    }
    req.refreshDoc = existing;
    next();
}