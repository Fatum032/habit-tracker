import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { TrackerProvider } from './context/TrackerContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardPage from './pages/DashboardPage'
import HabitEditPage from './pages/HabitEditPage'
import HabitNewPage from './pages/HabitNewPage'
import HabitsPage from './pages/HabitsPage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import ScripturesPage from './pages/ScripturesPage'
import PrayersPage from './pages/PrayersPage'
import PrayerNewPage from './pages/PrayerNewPage'
import PrayerTopicPage from './pages/PrayerTopicPage'

export default function App() {
  return (
    <AuthProvider>
      <TrackerProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/habits" element={<HabitsPage />} />
                <Route path="/habits/new" element={<HabitNewPage />} />
                <Route path="/habits/:id/edit" element={<HabitEditPage />} />
                <Route path="/scriptures" element={<ScripturesPage />} />
                <Route path="/prayers" element={<PrayersPage />} />
                <Route path="/prayers/new" element={<PrayerNewPage />} />
                <Route path="/prayers/:id" element={<PrayerTopicPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </TrackerProvider>
    </AuthProvider>
  )
}
