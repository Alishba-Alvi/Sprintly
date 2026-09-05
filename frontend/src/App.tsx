import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import ProjectsPage from './pages/ProjectsPage';
import MembersPage from './pages/MembersPage';
// import IssuesPage from './pages/IssuesPage';
import CreateIssuePage from './pages/CreateIssuePage';
import IssueDetailPage from './pages/IssueDetailPage';
import { NotFoundPage } from './pages/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { api } from './app/api';
import { setCredentials, logout } from './features/auth/authSlice';
import type { AppDispatch } from './app/store';

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const refreshResult = await dispatch(api.endpoints.refresh.initiate()).unwrap();

        dispatch(setCredentials({ accessToken: refreshResult.accessToken }));

        const meResult = await dispatch(api.endpoints.getMe.initiate());
        if ('data' in meResult && meResult.data) {
          dispatch(
            setCredentials({
              accessToken: refreshResult.accessToken,
              user: {
                id: meResult.data.userId,
                email: meResult.data.email,
                systemRole: meResult.data.role,
                name: '',
              },
            }),
          );
        }
      } catch {
        dispatch(logout());
      } finally {
        setAuthChecked(true);
      }
    };

    restoreSession();
  }, [dispatch]);

  if (!authChecked) {
    return null;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<ProjectsPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:projectId/members" element={<MembersPage />} />
            {/* <Route path="/projects/:projectId/issues" element={<CreateIssuesPage />} /> */}
            <Route path="/projects/:projectId/issues/new" element={<CreateIssuePage />} />
            <Route path="/projects/:projectId/issues/:issueId" element={<IssueDetailPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;