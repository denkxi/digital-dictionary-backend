import {Request, Response, NextFunction} from "express";
import {AuthService} from "../services/auth.service";

export async function register(req: Request, res: Response, next: NextFunction) {
    try {
        const { name, email, password } = req.body;
        const user = await AuthService.register(name, email, password);
        res.status(201).json(user);
    }
    catch (error){
        next(error);
    }
}

export async function login(req: Request, res: Response, next: NextFunction){
    try {
        const { email, password } = req.body;
        const ip = req.ip;
        const ua = req.get('User-Agent') || '';
        const { user, accessToken, refreshToken } = await AuthService.login(email, password, ip, ua);
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: AuthService.getRefreshTokenTTL() * 1000,
        });
        res.json({user, accessToken});
    }
    catch (error){
        next(error);
    }
}

export async function refresh(req: Request, res: Response, next: NextFunction){
    try {
        const token = req.cookies.refreshToken;
        const ip = req.ip;
        const ua = req.get('User-Agent') || '';
        const { accessToken, refreshToken: newToken } = await AuthService.refreshToken(token, ip, ua);
        res.cookie('refreshToken', newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: AuthService.getRefreshTokenTTL() * 1000,
        });
        res.json({ accessToken })
    }
    catch (error){
        next(error);
    }
}

export async function logout(req: Request, res: Response, next: NextFunction){
    try {
        const token = req.cookies.refreshToken;
        await AuthService.logout(token);
        res.clearCookie('refreshToken');
        res.json({message: 'Logout successful'});
    }
    catch (error){
        next(error);
    }
}