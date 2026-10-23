import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './AuthContext'
import AdminLogin from './AdminLogin'
import AdminLayout from './AdminLayout'
import Dashboard from './Dashboard'
import Quotes from './Quotes'
import Messages from './Messages'
import Registrations from './Registrations'
import Resources from './Resources'
import Settings from './Settings'
import Users from './Users'
import { Spinner } from '../components/ui'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { admin, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-950 text-navy-300">
        <Spinner className="h-6 w-6" />
      </div>
    )
  }
  if (!admin) return <Navigate to="/admin/login" replace />
  return <>{children}</>
}

function LoginRoute() {
  const { admin, loading } = useAuth()
  if (loading) return null
  if (admin) return <Navigate to="/admin" replace />
  return <AdminLogin />
}

export default function AdminApp() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="login" element={<LoginRoute />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="demandes" element={<Quotes />} />
          <Route path="messages" element={<Messages />} />
          <Route path="inscriptions" element={<Registrations />} />
          <Route path="services" element={<Resources resource="services" />} />
          <Route path="biens" element={<Resources resource="properties" />} />
          <Route path="realisations" element={<Resources resource="projects" />} />
          <Route path="formations" element={<Resources resource="courses" />} />
          <Route path="parametres" element={<Settings />} />
          <Route path="utilisateurs" element={<Users />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
