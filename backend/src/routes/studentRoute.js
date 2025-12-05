import e from "express";
import { createStudent, getAllStudents } from "../controllers/studentController.js";

const router = e.Router();

router.get('/', getAllStudents);
router.post('/student',createStudent);

export default router;