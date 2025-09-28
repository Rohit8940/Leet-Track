import { SignOutButton, UserButton } from "@clerk/clerk-react"
import { NavLink, Outlet } from "react-router-dom"
import DashboardProvider from "./DashboardProvider.jsx"
import { useDashboardData } from "./DashboardContext.jsx"
import { formatFullDate } from "./dashboardUtils.js"
import "./dashboard.css"

const navLinks = [
  { to: "overview", label: "Overview" },
  { to: "analytics", label: "Analytics" },
  { to: "backlog", label: "Backlog" },
]

const DashboardChrome = () => {
  const { displayName, userLoaded, today } = useDashboardData()

  return (
    <div className="dashboard-backdrop">
      <div className="dashboard-nebula" aria-hidden="true" />
      <div className="dashboard-nebula dashboard-nebula--b" aria-hidden="true" />
      <div className="dashboard-app">
        <aside className="dashboard-nav">
          <div className="nav-brand">
            <span className="brand-orb" aria-hidden="true" />
            <div>
              <strong>Leet-Track</strong>
              <span>Mastery cadence</span>
            </div>
          </div>
          <nav className="nav-links">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => (isActive ? "nav-link is-active" : "nav-link")}
              >
                <span className="nav-indicator" aria-hidden="true" />
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="nav-footer">
            <p>
              3 · 7 · 15 cadence
              <br /> consistency tracker
            </p>
          </div>
        </aside>
        <main className="dashboard-main">
          <header className="dashboard-topbar">
            <div className="topbar-heading">
              <span className="topbar-date">{formatFullDate(today)}</span>
              <h1>
                Welcome back, <span>{userLoaded ? displayName || "Explorer" : "…"}</span>
              </h1>
            </div>
            <div className="topbar-actions">
              <div className="topbar-profile">
                <div className="profile-copy">
                  <span>Ready to review?</span>
                  <strong>{displayName || "Your cadence"}</strong>
                </div>
                <UserButton
                  afterSignOutUrl="/sign-in"
                  appearance={{ elements: { userButtonTrigger: "user-trigger" } }}
                />
              </div>
              <SignOutButton afterSignOutUrl="/sign-in">
                <button type="button" className="logout-button">
                  Logout
                </button>
              </SignOutButton>
            </div>
          </header>
          <div className="dashboard-content">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

const DashboardLayout = () => (
  <DashboardProvider>
    <DashboardChrome />
  </DashboardProvider>
)

export default DashboardLayout




