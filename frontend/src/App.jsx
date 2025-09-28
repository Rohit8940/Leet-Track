import { SignedIn, SignedOut } from "@clerk/clerk-react"
import { Navigate, Route, Routes } from "react-router-dom"
import AuthLayout from "./components/AuthLayout.jsx"
import DashboardLayout from "./components/dashboard/DashboardLayout.jsx"
import Overview from "./components/dashboard/Overview.jsx"
import Analytics from "./components/dashboard/Analytics.jsx"
import Backlog from "./components/dashboard/Backlog.jsx"

const ProtectedRoute = ({ children }) => (
  <>
    <SignedIn>{children}</SignedIn>
    <SignedOut>
      <Navigate to="/sign-in" replace />
    </SignedOut>
  </>
)

const SignInPage = () => <AuthLayout mode="sign-in" />
const SignUpPage = () => <AuthLayout mode="sign-up" />

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard/overview" replace />} />
      <Route
        path="/dashboard"
        element={(
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        )}
      >
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<Overview />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="backlog" element={<Backlog />} />
      </Route>
      <Route path="/sign-in/*" element={<SignInPage />} />
      <Route path="/sign-up/*" element={<SignUpPage />} />
      <Route path="*" element={<Navigate to="/dashboard/overview" replace />} />
    </Routes>
  )
}

export default App
