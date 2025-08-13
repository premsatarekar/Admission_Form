import { createCourse, getCourses, updateCourse, deleteCourse } from "../models/courseModel.js";

export const addCourse = async (req, res) => {
  try {
    const { name, fee } = req.body;
    await createCourse(name, fee);
    res.status(201).json({ message: "Course added" });
  } catch (err) {
    res.status(500).json({ message: err.message || err });
  }
};

export const fetchCourses = async (req, res) => {
  try {
    const results = await getCourses();
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message || err });
  }
};

export const editCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, fee } = req.body;
    await updateCourse(id, name, fee);
    res.json({ message: "Course updated" });
  } catch (err) {
    res.status(500).json({ message: err.message || err });
  }
};

export const removeCourse = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteCourse(id);
    res.json({ message: "Course deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message || err });
  }
};
