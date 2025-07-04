import prisma from '@packages/lib/prisma';
import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';

/**
 * Middleware to check if the user or seller is authenticated.
 * Verifies JWT token from cookies or Authorization header.
 */
const isAuthenticated = async (
    req: any,
    res: Response,
    next: NextFunction
) => {
    try {
        // Get token from cookies or Authorization header
        const token =
            req.cookies['seller-access-token'] ||
            req.cookies['seller-refresh-token'] ||
            (req.headers.authorization && req.headers.authorization.startsWith('Bearer')
            ? req.headers.authorization.split(' ')[1]
            : null);

        // If no token found, return unauthorized
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized! Token missing.' });
        }

        // Verify token and extract payload
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
            id: string;
            role: 'user' | 'seller';
        };

        // If token is invalid, return unauthorized
        if (!decoded) {
            return res.status(401).json({ message: 'Unauthorized! Invalid token' });
        }

        let account;
        // If role is user, fetch user account
        if (decoded.role === 'user') {
            account = await prisma.users.findUnique({ where: { id: decoded.id } });
            req.user = account;
        // If role is seller, fetch seller account and include shop details
        } else if (decoded.role === 'seller') {
            account = await prisma.sellers.findUnique({
                where: { id: decoded.id },
                include: {
                    shop: true,
                },
            });
            req.seller = account;
        }

        // If account not found, return unauthorized
        if (!account) {
            return res.status(401).json({ message: 'Account not found!' });
        }

        // Attach role to request object
        req.role = decoded.role;
        return next();
    } catch (error: unknown) {
        // Handle errors (e.g., token expired or invalid)
        const message = error instanceof Error ? error.message : 'Token expired or invalid';
        return res
            .status(401)
            .json({ message: `Unauthorized seller! ${message}` });
    }
};

export default isAuthenticated;
