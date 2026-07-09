import { Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import HomePage from './pages/HomePage';
import FishDetailPage from './pages/FishDetailPage';
import SearchPage from './pages/SearchPage';
import SavedPage from './pages/SavedPage';
import CalendarPage from './pages/CalendarPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/fish/:id" element={<FishDetailPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/saved" element={<SavedPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
    </AppLayout>
  );
}
