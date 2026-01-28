import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MainLayout } from './components/layout/MainLayout';
import { RoleSelection } from './pages/RoleSelection';
import { LoginForm } from './pages/LoginForm';
import { ProtectedRoute } from './routes/ProtectedRoute';

// Pages
import { StudentDashboard } from './pages/student/Dashboard';
import { StudentAssessment } from './pages/student/Assessment';
import { StudentCommunication } from './pages/student/Communication';
import { StudentLeaderboard } from './pages/student/Leaderboard';
import { StudentProfile } from './pages/student/Profile';

import { StaffAssignAssessment } from './pages/staff/AssignAssessment';
import { StaffDashboard } from './pages/staff/Dashboard';
import { AdminDashboard } from './pages/admin/Dashboard';
import { StaffAssignInterview } from './pages/staff/AssignInterview';
import { StaffStudentAnalysis } from './pages/staff/StudentAnalysis';
import { StaffProfile } from './pages/staff/Profile';

import { AssessmentRunner } from './pages/student/AssessmentRunner';
import { InterviewSession } from './pages/student/InterviewSession';
import { StaffGradingConsole } from './pages/staff/GradingConsole';
import { AdminUserManagement } from './pages/admin/UserManagement';
import { AdminProfile } from './pages/admin/Profile';

import { AdminAddUser } from './pages/admin/AddUser';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RoleSelection />} />
          <Route path="/login/:role" element={<LoginForm />} />

          {/* Student Routes - Exam Pages (No Sidebar) */}
          <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
            <Route path="/student/assessment/:id" element={<AssessmentRunner />} />
            <Route path="/student/interview/:id" element={<InterviewSession />} />
          </Route>

          {/* Student Routes - Normal Pages (With Sidebar) */}
          <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
            <Route path="/student" element={<MainLayout />}>
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="assessment" element={<StudentAssessment />} />
              <Route path="communication" element={<StudentCommunication />} />
              <Route path="leaderboard" element={<StudentLeaderboard />} />
              <Route path="profile" element={<StudentProfile />} />
              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>
          </Route>

          {/* Staff Routes */}
          <Route element={<ProtectedRoute allowedRoles={['STAFF']} />}>
            <Route path="/staff" element={<MainLayout />}>
              <Route path="dashboard" element={<StaffDashboard />} />
              <Route path="assign-assessment" element={<StaffAssignAssessment />} />
              <Route path="assign-interview" element={<StaffAssignInterview />} />
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
              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
