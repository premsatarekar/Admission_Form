import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import { FaTachometerAlt } from 'react-icons/fa';
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
  useNavigate,
} from 'react-router-dom';
import AddCourse from './components/AddCourse';
import AddCourseKaushalKendra from './components/AddCourseKaushalKendra';
import ForgotPassword from './components/Auth/ForgotPassword';
import Login from './components/Auth/Login';
import OtpVerification from './components/Auth/OtpVerification';
import ResetPassword from './components/Auth/ResetPassword';
import Dashboard from './components/Dashboard';
import KaushalKendraForm from './components/KaushalKendraForm';
import KaushalKendraEdit from './components/KaushalKendraFormEdit';
import KaushalKendraFormList from './components/KaushalKendraFormList';
import PrivateRoute from './components/PrivateRoute';
import VizionexlForm from './components/VizionexlForm';
import VizionexlFormEdit from './components/VizionexlFormEdit';
import AdmissionList from './components/VizionexlFormList';
import { AuthProvider } from './context/AuthContext';
import DashboardKK from './components/DashboardKK';

function Home() {
  const [department, setDepartment] = useState('vizionexl');
  const navigate = useNavigate();

  return (
    <>
      <div className="d-flex justify-content-center align-items-center gap-3 mb-4">
        <button
          className={`btn ${
            department === 'vizionexl' ? 'btn-primary' : 'btn-outline-primary'
          }`}
          onClick={() => setDepartment('vizionexl')}
        >
          Vizionexl Technologies
        </button>
        <button
          className={`btn ${
            department === 'kaushal' ? 'btn-primary' : 'btn-outline-primary'
          }`}
          onClick={() => setDepartment('kaushal')}
        >
          Kaushal Kendra
        </button>
        <button
          type="button"
          className="btn btn-success d-flex align-items-center"
          onClick={() => navigate('/dashboard')}
        >
          <FaTachometerAlt style={{ marginRight: '6px' }} />
          Dashboard
        </button>
      </div>
      {department === 'vizionexl' ? <VizionexlForm /> : <KaushalKendraForm />}
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="container mt-5">
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-otp" element={<OtpVerification />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/kaushal-Kendra-dashboard"
              element={
                <PrivateRoute>
                  <DashboardKK />
                </PrivateRoute>
              }
            />
            <Route
              path="/home"
              element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              }
            />
            <Route
              path="/add-course"
              element={
                <PrivateRoute>
                  <AddCourse />
                </PrivateRoute>
              }
            />
            <Route
              path="/add-course-kaushalkendra"
              element={
                <PrivateRoute>
                  <AddCourseKaushalKendra />
                </PrivateRoute>
              }
            />
            <Route
              path="/admission-list"
              element={
                <PrivateRoute>
                  <AdmissionList />
                </PrivateRoute>
              }
            />
            <Route
              path="/kaushal-kendra-list"
              element={
                <PrivateRoute>
                  <KaushalKendraFormList />
                </PrivateRoute>
              }
            />
            <Route
              path="/edit/:id"
              element={
                <PrivateRoute>
                  <VizionexlFormEdit />
                </PrivateRoute>
              }
            />
            <Route
              path="/kaushal-kendra/edit/:id"
              element={
                <PrivateRoute>
                  <KaushalKendraEdit />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
