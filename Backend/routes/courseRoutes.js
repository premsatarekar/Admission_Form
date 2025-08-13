import express from "express";
import { addCourse, fetchCourses, editCourse, removeCourse } from "../controllers/courseController.js";

const router = express.Router();

router.post("/", addCourse);
router.get("/", fetchCourses);
router.put("/:id", editCourse);
router.delete("/:id", removeCourse);

export default router;
