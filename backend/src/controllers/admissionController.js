import {dbpool as db} from "../config/db.js";
import bcrypt from "bcrypt";

// POST /api/admission/create
export const createAdmission = async (req, res) => {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        const { guardian, guardian_id, student } = req.body;

        let finalGuardianId;

        // ---------------------------------------------
        // CASE 1: Guardian is NEW
        // ---------------------------------------------
        if (!guardian_id) {
            if (!guardian) {
                throw new Error("Guardian data missing");
            }

            // Hash password
            const hashedGPassword = await bcrypt.hash(guardian.password, 10);

            // Create guardian user
            const [guardianUserResult] = await connection.execute(
                `INSERT INTO users (first_name, mid_name, last_name, username, email, password, role)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    guardian.first_name,
                    guardian.mid_name || null,
                    guardian.last_name,
                    guardian.username,
                    guardian.email,
                    hashedGPassword,
                    "guardian"
                ]
            );

            finalGuardianId = guardianUserResult.insertId;

            // Insert into guardians table
            await connection.execute(
                `INSERT INTO guardians (user_id, occupation, address)
                 VALUES (?, ?, ?)`,
                [
                    finalGuardianId,
                    guardian.occupation,
                    guardian.address
                ]
            );
        }

        // ---------------------------------------------
        // CASE 2: Guardian ALREADY EXISTS
        // ---------------------------------------------
        else {
            finalGuardianId = guardian_id;

            // Validate guardian exists
            const [checkGuardian] = await connection.execute(
                `SELECT id FROM users WHERE id = ? AND role = 'guardian'`,
                [guardian_id]
            );

            if (checkGuardian.length === 0) {
                throw new Error("Guardian does not exist");
            }
        }

        // ---------------------------------------------
        // CREATE STUDENT ACCOUNT
        // ---------------------------------------------

        const hashedSPassword = await bcrypt.hash(student.password, 10);

        // Insert user record for student
        const [studentUserResult] = await connection.execute(
            `INSERT INTO users (first_name, mid_name, last_name, username, email, password, role)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                student.first_name,
                student.mid_name || null,
                student.last_name,
                student.username,
                student.email,
                hashedSPassword,
                "student"
            ]
        );

        const studentUserId = studentUserResult.insertId;

        console.log("i ma here, the user data:",req.user.id)

        // Insert student record
        await connection.execute(
            `INSERT INTO students 
                (user_id, roll_no, level, section, program_name, guardian_relation, guardian_id, created_by, updated_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                studentUserId,
                student.roll_no,
                student.level,
                student.section,
                student.program_name,
                student.guardian_relation,
                finalGuardianId,
                req.user.id,   // admin who created
                req.user.id
            ]
        );

        // Commit changes
        await connection.commit();
        connection.release();

        return res.status(201).json({
            success: true,
            message: "Student admission successful",
            student_user_id: studentUserId,
            guardian_id: finalGuardianId
        });

    } catch (error) {
        await connection.rollback();
        connection.release();

        return res.status(500).json({
            success: false,
            message: "Admission failed",
            error: error
        });
    }
};
