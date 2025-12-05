import { dbpool as db } from "../config/db.js";

export const createStudent = async (req, res) => {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        const { guardian_detail: gd, student_detail: sd } = req.body;

        // create guardian account
        const [{ insertId: gid }] = await connection.execute(
            `INSERT INTO users (first_name, mid_name, last_name, username, email, password, role, img_url) 
            VALUES (?,?,?,?,?,?,?)`, [gd.fname, gd.mname, gd.lname, gd.username, gd.email, gd.password, 3, gd.img_url]
        );

        // create student account
        const [{ insertId: sid }] = await connection.execute(
            `INSERT INTO users (first_name, mid_name, last_name, username, email, password, role, img_url) 
            VALUES (?,?,?,?,?,?,?)`, [sd.fname, sd.mname, sd.lname, sd.username, sd.email, sd.password, 3, sd.img_url]
        )

        // adding into guardians table
        await connection.execute(
            `INSERT INTO guardians (user_id, occupation, full_address) VALUES (?,?,?)`, [gid, gd.occupation, gd.full_address]
        )

        // adding into students table
        await connection.execute(
            `INSERT INTO students 
            (user_id, roll_no, level, section, program_name, guardian_relation, guardian_id,created_by,updated_by)
            VALUES (?,?,?,?,?,?,?,?)`, [sid, sd.roll_no, sd.level, sd.section, sd.program_name, sd.guardian_relation, gid, body.user.id, body.user.id]
        )

        connection.commit();
        connection.release();

    } catch (error) {
        await connection.rollback();
        connection.release();

        return res.status(500).json({
            message: "Transaction failed",
            error: error.message
        });
    }
}

export const getAllStudents = async (req, res) => {
    try {
        const [data] = await db.query(`SELECT id, first_name, mid_name, last_name, roll_no, level, section, program_name, admission_date, academic_status, guardian_id,guardian_relation, username, email,img_url FROM students s JOIN users u ON s.user_id = u.id`)
        res.json(data);
    } catch (error) {
        console.log(error.message);
        res.status(401).json({ message: error.message });
    }
}