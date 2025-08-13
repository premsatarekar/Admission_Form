import axios from 'axios';
import { useEffect, useState } from 'react';
import {
  FaArrowLeft,
  FaEdit,
  FaPlusCircle,
  FaSave,
  FaTimes,
  FaTrashAlt,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000/api';

export default function AddCourse() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [newCourse, setNewCourse] = useState({ name: '', fee: '' });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ name: '', fee: '' });

  // Fetch courses from backend
  const fetchCourses = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/courses`);
      setCourses(res.data);
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Add new course
  const handleAddCourse = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BASE_URL}/courses`, {
        name: newCourse.name.trim(),
        fee: parseFloat(newCourse.fee),
      });
      setNewCourse({ name: '', fee: '' });
      fetchCourses();
    } catch (err) {
      alert('Failed to add course');
      console.error(err);
    }
  };

  // Start editing a course
  const startEditing = (course) => {
    setEditingId(course.id);
    setEditData({ name: course.name, fee: course.fee.toString() });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingId(null);
    setEditData({ name: '', fee: '' });
  };

  // Save edited course
  const saveEdit = async (id) => {
    try {
      await axios.put(`${BASE_URL}/courses/${id}`, {
        name: editData.name.trim(),
        fee: parseFloat(editData.fee),
      });
      setEditingId(null);
      setEditData({ name: '', fee: '' });
      fetchCourses();
    } catch (err) {
      alert('Failed to update course');
      console.error(err);
    }
  };

  // Delete course
  const deleteCourse = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    try {
      await axios.delete(`${BASE_URL}/courses/${id}`);
      fetchCourses();
    } catch (err) {
      alert('Failed to delete course');
      console.error(err);
    }
  };

  return (
    <div
      className="container p-4 border rounded bg-white shadow"
      style={{ maxWidth: 600 }}
    >
      <h4 className="mb-3">Add New Course</h4>

      <form onSubmit={handleAddCourse} className="d-flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Course Name"
          className="form-control form-control-sm"
          value={newCourse.name}
          onChange={(e) =>
            setNewCourse((prev) => ({ ...prev, name: e.target.value }))
          }
          required
        />
        <input
          type="number"
          min="0"
          placeholder="Course Fee"
          className="form-control form-control-sm"
          value={newCourse.fee}
          onChange={(e) =>
            setNewCourse((prev) => ({ ...prev, fee: e.target.value }))
          }
          required
        />
        <button
          type="submit"
          className="btn btn-success btn-sm d-flex align-items-center gap-1"
          disabled={
            !newCourse.name.trim() ||
            !newCourse.fee ||
            Number(newCourse.fee) < 0
          }
        >
          <FaPlusCircle /> Add
        </button>
        <button
          type="button"
          className="btn btn-success btn-sm d-flex align-items-center gap-1"
          onClick={() => navigate('/home')}
        >
          <FaArrowLeft /> Back
        </button>
      </form>

      <h5>Existing Courses</h5>
      <div className="table-responsive">
        <table
          className="table table-bordered table-hover align-middle"
          style={{ fontSize: '0.9rem' }}
        >
          <thead className="table-dark text-center">
            <tr>
              <th style={{ width: '5%' }}>#</th>
              <th style={{ width: '55%' }}>Course Name</th>
              <th style={{ width: '20%' }}>Fee (₹)</th>
              <th style={{ width: '20%' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center text-muted py-3">
                  No courses found.
                </td>
              </tr>
            ) : (
              courses.map((course, index) => (
                <tr key={course.id}>
                  <td className="text-center">{index + 1}</td>
                  <td>
                    {editingId === course.id ? (
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={editData.name}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        required
                      />
                    ) : (
                      course.name
                    )}
                  </td>
                  <td>
                    {editingId === course.id ? (
                      <input
                        type="number"
                        min="0"
                        className="form-control form-control-sm"
                        value={editData.fee}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            fee: e.target.value,
                          }))
                        }
                        required
                      />
                    ) : (
                      `₹ ${course.fee}`
                    )}
                  </td>
                  <td className="text-center">
                    {editingId === course.id ? (
                      <>
                        <button
                          className="btn btn-sm btn-success me-1"
                          onClick={() => saveEdit(course.id)}
                          title="Save"
                          type="button"
                        >
                          <FaSave />
                        </button>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={cancelEditing}
                          title="Cancel"
                          type="button"
                        >
                          <FaTimes />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="btn btn-sm btn-primary me-1"
                          onClick={() => startEditing(course)}
                          title="Edit"
                          type="button"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => deleteCourse(course.id)}
                          title="Delete"
                          type="button"
                        >
                          <FaTrashAlt />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
