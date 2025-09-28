import { createContext, useContext } from "react"

export const DashboardDataContext = createContext(null)

export const useDashboardData = () => {
  const context = useContext(DashboardDataContext)
  if (!context) {
    throw new Error("useDashboardData must be used within a DashboardProvider")
  }
  return context
}
