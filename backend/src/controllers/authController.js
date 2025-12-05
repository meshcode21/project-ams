import jwt from 'jsonwebtoken'
import {dbpool as db} from '../config/db.js'

export const loginUser = (req, res) => {
    const { username, password: clientPassword } = req.body;

    const query = `SELECT * FROM users where username = ?`;

    db.query(query, [username])
        .then(results => {
            // Check if user was not found
            if (results[0].length === 0) { 
                return res.status(401).json({ message: "Invalid username or password" });
            }

            // Access the password from the database result
            const dbUser = results[0][0];
            const dbPassword = dbUser.password; // Renamed to dbPassword

            if (clientPassword === dbPassword) {
                // token generation
                const token = jwt.sign(
                    { id: dbUser.id },
                    process.env.SECRET,
                    { expiresIn: '1h' }
                )
                res.json({ message: "Login successful", token: token });
            } else {
                res.status(401).json({ message: "Invalid username or password" });
            }
        })
        .catch(error => {
            console.error("Database error:", error); // Use console.error for errors
            res.status(500).json({ message: "An internal server error occurred", error: error });
        });
}