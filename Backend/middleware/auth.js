// server/middleware/auth.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

export const verifyResetToken = (req, res, next) => {
    const token = req.header('x-reset-token');

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        if (decoded.purpose !== 'password_reset') {
            return res.status(401).json({ message: 'Invalid token purpose' });
        }

        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid or expired' });
    }
};
