import jwt from 'jsonwebtoken'
import {dbpool as db} from '../config/db.js'

export const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer"))
            return res.status(401).json({ message: "Unauthorize: No token provided" });

        // access token from header 
        const token = authHeader.split(" ")[1];
        const payload = jwt.verify(token, process.env.SECRET);

        // fetching data from database
        const data = await db.query("SELECT id, first_name, mid_name, last_name, email, role, status FROM users WHERE id = ?", [payload.id])
        const userData = data[0][0];

        // if user not found
        if (!userData) return res.status(401).json({ message: "Unauthorized: user not found." });

        // if account is inactive
        if (userData.status != "active") return res.status(403).json({ message: "Account not active" })

        // Adding user data to request body.
        req.user = userData;
        console.log("i am authentication middleware...",req.user)

        next();

    } catch (err) {
        console.error('Auth error', err.message || err);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
}


export const authorize = (allowedRoles = []) => {
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
        // allowedRoles might be e.g. ['ADMIN'] or ['TEACHER','ADMIN']
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
        }
        console.log('allowed for ', allowedRoles)
        next();
    };
};