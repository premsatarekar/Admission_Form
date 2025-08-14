import axios from 'axios';
import { useEffect, useState } from 'react';
import {
  FaArrowLeft,
  FaEdit,
  FaPlusCircle,
  FaSave,
  FaTachometerAlt,
  FaTimes,
  FaTrashAlt,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000/api';

export default function AddCourseKaushalKendra() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [newCourse, setNewCourse] = useState({ name: '', fee: '' });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ name: '', fee: '' });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch courses from backend
  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${BASE_URL}/courses-kaushal-kendra`);
      setCourses(
        Array.isArray(res.data?.data) ? res.data.data : res.data || []
      );
    } catch (err) {
      console.error('Error fetching courses:', err);
      if (err.response?.status === 404) {
        toast.error(
          'Courses endpoint not found. Please check the server configuration.'
        );
      } else {
        toast.error(
          err.response?.data?.message ||
            'Failed to load courses. Please try again.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Add new course
  const handleAddCourse = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await axios.post(`${BASE_URL}/courses-kaushal-kendra`, {
        name: newCourse.name.trim(),
        fee: parseFloat(newCourse.fee),
      });
      setNewCourse({ name: '', fee: '' });
      toast.success('Course added successfully');
      fetchCourses();
    } catch (err) {
      console.error('Error adding course:', err);
      toast.error(
        err.response?.data?.message || 'Failed to add course. Please try again.'
      );
    } finally {
      setIsLoading(false);
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
      setIsLoading(true);
      await axios.put(`${BASE_URL}/courses-kaushal-kendra/${id}`, {
        name: editData.name.trim(),
        fee: parseFloat(editData.fee),
      });
      setEditingId(null);
      setEditData({ name: '', fee: '' });
      toast.success('Course updated successfully');
      fetchCourses();
    } catch (err) {
      console.error('Error updating course:', err);
      toast.error(
        err.response?.data?.message ||
          'Failed to update course. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Delete course
  const deleteCourse = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      setIsLoading(true);
      await axios.delete(`${BASE_URL}/courses-kaushal-kendra/${id}`);
      toast.success('Course deleted successfully');
      fetchCourses();
    } catch (err) {
      console.error('Error deleting course:', err);
      toast.error(
        err.response?.data?.message ||
          'Failed to delete course. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container p-4">
      <ToastContainer />
      <div className="card shadow-sm">
        <div className="card-header bg-white border-bottom">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">Manage Courses - Kaushal Kendra</h4>
            <div className="d-flex gap-2">
              <button
                className="btn btn-primary btn-sm d-flex align-items-center gap-1"
                onClick={() => navigate('/home')}
              >
                <FaArrowLeft /> Back to Form
              </button>
              <button
                className="btn btn-success btn-sm d-flex align-items-center gap-1"
                onClick={() => navigate('/dashboard')}
              >
                <FaTachometerAlt /> Dashboard
              </button>
            </div>
          </div>
        </div>

        <div className="card-body">
          <form onSubmit={handleAddCourse} className="mb-4">
            <div className="row g-2">
              <div className="col-md-5">
                <input
                  type="text"
                  placeholder="Course Name"
                  className="form-control form-control-sm"
                  value={newCourse.name}
                  onChange={(e) =>
                    setNewCourse((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="col-md-3">
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="Course Fee (₹)"
                  className="form-control form-control-sm"
                  value={newCourse.fee}
                  onChange={(e) =>
                    setNewCourse((prev) => ({ ...prev, fee: e.target.value }))
                  }
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="col-md-4">
                <button
                  type="submit"
                  className="btn btn-success btn-sm w-100 d-flex align-items-center justify-content-center gap-1"
                  disabled={
                    isLoading ||
                    !newCourse.name.trim() ||
                    !newCourse.fee ||
                    Number(newCourse.fee) < 0
                  }
                >
                  {isLoading ? (
                    <span className="spinner-border spinner-border-sm me-1"></span>
                  ) : (
                    <FaPlusCircle />
                  )}
                  Add Course
                </button>
              </div>
            </div>
          </form>

          <h5 className="mb-3">Existing Courses</h5>
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
                {isLoading && courses.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-4">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : courses.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center text-muted py-3">
                      No courses found. Add your first course above.
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
                            disabled={isLoading}
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
                            step="any"
                            className="form-control form-control-sm"
                            value={editData.fee}
                            onChange={(e) =>
                              setEditData((prev) => ({
                                ...prev,
                                fee: e.target.value,
                              }))
                            }
                            required
                            disabled={isLoading}
                          />
                        ) : (
                          `₹${parseFloat(course.fee).toLocaleString('en-IN')}`
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
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <span className="spinner-border spinner-border-sm"></span>
                              ) : (
                                <FaSave />
                              )}
                            </button>
                            <button
                              className="btn btn-sm btn-secondary"
                              onClick={cancelEditing}
                              title="Cancel"
                              type="button"
                              disabled={isLoading}
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
                              disabled={isLoading}
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => deleteCourse(course.id)}
                              title="Delete"
                              type="button"
                              disabled={isLoading}
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
      </div>
    </div>
  );
}
