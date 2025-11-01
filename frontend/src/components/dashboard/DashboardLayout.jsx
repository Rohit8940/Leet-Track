import { SignOutButton, UserButton } from "@clerk/clerk-react"
import { useEffect, useState } from "react"
import { NavLink, Outlet, useLocation } from "react-router-dom"
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
  const { pathname } = useLocation()
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [isMobileViewport, setIsMobileViewport] = useState(
    typeof window !== "undefined" ? window.matchMedia("(max-width: 1024px)").matches : false,
  )

  const closeMobileNav = () => {
    if (!isMobileViewport) return
    setIsMobileNavOpen(false)
  }
  const toggleMobileNav = () => {
    if (!isMobileViewport) return
    setIsMobileNavOpen((prev) => !prev)
  }

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined
    }

    const mediaQuery = window.matchMedia("(max-width: 1024px)")

    const updateViewport = (matches) => {
      setIsMobileViewport(matches)
      if (!matches) {
        setIsMobileNavOpen(false)
      }
    }

    updateViewport(mediaQuery.matches)

    const handleChange = (event) => updateViewport(event.matches)

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  useEffect(() => {
    if (typeof document === "undefined" || !isMobileViewport || !isMobileNavOpen) {
      return undefined
    }

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [isMobileNavOpen, isMobileViewport])

  useEffect(() => {
    if (!isMobileNavOpen) return

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsMobileNavOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isMobileNavOpen])

  useEffect(() => {
    setIsMobileNavOpen(false)
  }, [pathname])

  return (
    <div className="dashboard-backdrop">
      <div className="dashboard-nebula" aria-hidden="true" />
      <div className="dashboard-nebula dashboard-nebula--b" aria-hidden="true" />
      <div className="dashboard-app">
        <button
          type="button"
          className={`nav-backdrop${isMobileNavOpen ? " is-active" : ""}`}
          aria-label="Close navigation"
          aria-hidden={!isMobileViewport || !isMobileNavOpen}
          tabIndex={isMobileViewport && isMobileNavOpen ? 0 : -1}
          onClick={closeMobileNav}
        />
        <aside
          id="dashboard-nav"
          className={`dashboard-nav${isMobileNavOpen ? " is-open" : ""}`}
          aria-hidden={isMobileViewport && !isMobileNavOpen}
        >
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
                onClick={closeMobileNav}
                tabIndex={isMobileViewport && !isMobileNavOpen ? -1 : undefined}
              >
                <span className="nav-indicator" aria-hidden="true" />
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="nav-footer">
            <p>
              3-7-15 cadence
              <br /> consistency tracker
            </p>
          </div>
        </aside>
        <main className="dashboard-main">
          <header className="dashboard-topbar">
            <button
              type="button"
              className={`nav-toggle${isMobileNavOpen ? " is-active" : ""}`}
              onClick={toggleMobileNav}
              aria-controls="dashboard-nav"
              aria-expanded={isMobileNavOpen}
              aria-label="Toggle navigation"
            >
              <span aria-hidden="true" />
              <span aria-hidden="true" />
              <span aria-hidden="true" />
            </button>
            <div className="topbar-heading">
              <span className="topbar-date">{formatFullDate(today)}</span>
              <h1>
                Welcome back, <span>{userLoaded ? displayName || "Explorer" : "..."}</span>
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




