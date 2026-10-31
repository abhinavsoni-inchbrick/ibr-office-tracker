import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Login } from './components/Login'
import { Activity } from './pages/Activity'
import { Boq } from './pages/Boq'
import { Dashboard } from './pages/Dashboard'
import { Expenses } from './pages/Expenses'
import { Files } from './pages/Files'
import { Phases } from './pages/Phases'
import { Tasks } from './pages/Tasks'
import { Team } from './pages/Team'
import { useStore } from './store/useStore'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const currentUserId = useStore((s) => s.currentUserId)
  const team = useStore((s) => s.team)
  const valid = currentUserId && team.some((m) => m.id === currentUserId)
  if (!valid) return <Login />
  return children
}

export default function App() {
  const base = import.meta.env.BASE_URL

  return (
    <BrowserRouter basename={base === '/' ? undefined : base.replace(/\/$/, '')}>
      <Routes>
        <Route
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="phases" element={<Phases />} />
          <Route path="files" element={<Files />} />
          <Route path="boq" element={<Boq />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="team" element={<Team />} />
          <Route path="activity" element={<Activity />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
