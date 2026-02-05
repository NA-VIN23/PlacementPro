import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { MainLayout } from './components/layout/MainLayout';
import { LoginForm } from './pages/LoginForm';
import { ProtectedRoute } from './routes/ProtectedRoute';

// Pages
import { StudentDashboard } from './pages/student/Dashboard';
import { StudentAssessment } from './pages/student/Assessment';
import { StudentCommunication } from './pages/student/Communication';
import { StudentLeaderboard } from './pages/student/Leaderboard';
import { StudentProfile } from './pages/student/Profile';
import { StudentLearning } from './pages/student/Learning';
import { ResumeBuilder } from './pages/student/resume/ResumeBuilder';
import { AssessmentResult } from './pages/student/AssessmentResult';

import { StaffAssignAssessment } from './pages/staff/AssignAssessment';
import { StaffDashboard } from './pages/staff/Dashboard';
import { AdminDashboard } from './pages/admin/Dashboard';
import { StaffStudentAnalysis } from './pages/staff/StudentAnalysis';
import { StaffProfile } from './pages/staff/Profile';
import { StudentList } from './pages/staff/StudentList';

import { AssessmentRunner } from './pages/student/AssessmentRunner';
import { InterviewSession } from './pages/student/InterviewSession';
import { StaffGradingConsole } from './pages/staff/GradingConsole';
import { AdminUserManagement } from './pages/admin/UserManagement';
import { AdminProfile } from './pages/admin/Profile';
import { StaffAssignment } from './pages/admin/StaffAssignment';

import { AdminAddUser } from './pages/admin/AddUser';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login/student" replace />} />
            <Route path="/login/:role" element={<LoginForm />} />


            {/* Student Routes */}
            <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
              {/* Exam Pages (No Sidebar) */}
              <Route path="/student/assessment/:id" element={<AssessmentRunner />} />
              <Route path="/student/assessment/result/:id" element={<AssessmentResult />} />
              <Route path="/student/interview" element={<InterviewSession />} />

              {/* Normal Pages (With Sidebar) */}
              <Route path="/student" element={<MainLayout />}>
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="assessment" element={<StudentAssessment />} />
                <Route path="learning" element={<StudentLearning />} />
                <Route path="communication" element={<StudentCommunication />} />
                <Route path="leaderboard" element={<StudentLeaderboard />} />
                <Route path="resume-builder" element={<ResumeBuilder />} />
                <Route path="profile" element={<StudentProfile />} />
                <Route index element={<Navigate to="dashboard" replace />} />
              </Route>
            </Route>

            {/* Staff Routes */}
            <Route element={<ProtectedRoute allowedRoles={['STAFF']} />}>
              <Route path="/staff" element={<MainLayout />}>
                <Route path="dashboard" element={<StaffDashboard />} />
                <Route path="assign-assessment" element={<StaffAssignAssessment />} />
                <Route path="students" element={<StudentList />} />
                <Route path="analysis" element={<StaffStudentAnalysis />} />
                <Route path="profile" element={<StaffProfile />} />
                <Route path="assessment/:id/grade" element={<StaffGradingConsole />} />
                <Route index element={<Navigate to="dashboard" replace />} />
              </Route>
            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="/admin" element={<MainLayout />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<AdminUserManagement />} />
                <Route path="users/add" element={<AdminAddUser />} />
                <Route path="profile" element={<AdminProfile />} />
                <Route path="staff-assignment" element={<StaffAssignment />} />
                <Route index element={<Navigate to="dashboard" replace />} />
              </Route>
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/login/student" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
