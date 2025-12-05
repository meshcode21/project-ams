import {dbpool as db} from '../config/db.js'


export const getAllUsers = async (req, res) => {
    try {
        const query = `SELECT id,first_name,mid_name,last_name,username,email,role,img_url,status,created_at, updated_at,last_login FROM users`;
        const [data] = await db.query(query);
        res.json(data);
    }catch(error){
        console.log(error.message);
    }
}