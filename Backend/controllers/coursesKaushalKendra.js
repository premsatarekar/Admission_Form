import * as coursesModel from '../models/coursesKaushalKendraModels.js';

export const getCourses = async (req, res) => {
  try {
    const courses = await coursesModel.getAllCourses();
    res.json({ success: true, data: courses });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const addCourse = async (req, res) => {
  try {
    const { name, fee } = req.body;
    if (!name || !fee || fee < 0) {
      return res
        .status(400)
        .json({ success: false, message: 'Name and valid fee are required' });
    }
    const course = await coursesModel.createCourse({ name, fee });
    res.status(201).json({ success: true, data: course });
  } catch (error) {
    console.error('Error adding course:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res
        .status(400)
        .json({ success: false, message: 'Course name already exists' });
    } else {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
};

export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, fee } = req.body;
    if (!name || !fee || fee < 0) {
      return res
        .status(400)
        .json({ success: false, message: 'Name and valid fee are required' });
    }
    const course = await coursesModel.updateCourse(id, { name, fee });
    res.json({ success: true, data: course });
  } catch (error) {
    console.error('Error updating course:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res
        .status(400)
        .json({ success: false, message: 'Course name already exists' });
    } else {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    await coursesModel.deleteCourse(id);
    res.json({ success: true, message: 'Course deleted' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
