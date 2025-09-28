import {
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
} from "recharts"
import { useDashboardData } from "./DashboardContext.jsx"

const TimelineTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) {
    return null
  }
  const due = payload.find((item) => item.dataKey === "due")?.value ?? 0
  const completed = payload.find((item) => item.dataKey === "completed")?.value ?? 0
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip__label">{label}</div>
      <div className="chart-tooltip__row">
        <span>Scheduled</span>
        <span>{due}</span>
      </div>
      <div className="chart-tooltip__row">
        <span>Completed</span>
        <span>{completed}</span>
      </div>
    </div>
  )
}

const Analytics = () => {
  const { timelineData, cadenceSummary, stats } = useDashboardData()

  return (
    <div className="dashboard-surface">
      <section className="analytics-metrics">
        <div className="metric-card">
          <span>Total checkpoints</span>
          <h2>{stats.totalReviews}</h2>
          <p>
            {stats.totalCompleted} completed · {stats.totalReviews - stats.totalCompleted} pending
          </p>
        </div>
        <div className="metric-card">
          <span>Completion rate</span>
          <h2>{stats.completionRate}%</h2>
          <p>Across your entire Leet-Track history</p>
        </div>
        <div className="metric-card">
          <span>Weekly velocity</span>
          <h2>{stats.recentCompletions}</h2>
          <p>Checkpoints completed in the past 7 days</p>
        </div>
      </section>

      <section className="panel chart-panel">
        <div className="panel-header">
          <div>
            <h3>Momentum tracker</h3>
            <p>Compare scheduled checkpoints vs completions across the past 14 days.</p>
          </div>
        </div>
        <div className="panel-body">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={timelineData} margin={{ left: 4, right: 8, top: 12, bottom: 0 }}>
              <defs>
                <linearGradient id="dueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity={0.7} />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 8" stroke="rgba(148, 163, 184, 0.2)" vertical={false} />
              <XAxis dataKey="date" stroke="rgba(226, 232, 240, 0.6)" tickLine={false} axisLine={false} />
              <Tooltip content={<TimelineTooltip />} cursor={{ stroke: "rgba(148, 163, 184, 0.25)" }} />
              <Legend verticalAlign="top" height={34} iconType="circle" />
              <Area
                type="monotone"
                dataKey="due"
                name="Scheduled"
                stroke="#38bdf8"
                strokeWidth={2.4}
                fill="url(#dueGradient)"
              />
              <Area
                type="monotone"
                dataKey="completed"
                name="Completed"
                stroke="#a855f7"
                strokeWidth={2.4}
                fill="url(#completedGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="panel chart-panel cadence-panel">
        <div className="panel-header">
          <div>
            <h3>Cadence coverage</h3>
            <p>See how each checkpoint rhythm is progressing.</p>
          </div>
        </div>
        <div className="panel-body cadence-body">
          <ResponsiveContainer width="100%" height={280}>
            <RadialBarChart
              cx="50%"
              cy="52%"
              innerRadius="30%"
              outerRadius="90%"
              data={cadenceSummary}
              startAngle={90}
              endAngle={-270}
            >
              <RadialBar
                minAngle={15}
                label={{ position: "insideStart", fill: "#0f172a", fontSize: 12, fontWeight: 600 }}
                clockWise
                background
                dataKey="progress"
              />
              <Legend
                iconType="circle"
                formatter={(value) => <span className="legend-label">{value}</span>}
                wrapperStyle={{ color: "rgba(226, 232, 240, 0.7)", fontSize: 12 }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <ul className="cadence-details">
            {cadenceSummary.map((item) => (
              <li key={item.name}>
                <span className="cadence-dot" style={{ background: item.fill }} />
                <div>
                  <strong>{item.name}</strong>
                  <p>
                    {item.completed} completed · {item.remaining} remaining · {item.progress}% complete
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="panel mini-panel">
        <div className="panel-header">
          <div>
            <h3>Recent completions</h3>
            <p>The dates below highlight when you last checked off a problem.</p>
          </div>
        </div>
        <div className="panel-body recent-completions">
          {timelineData.filter((item) => item.completed > 0).length === 0 ? (
            <p className="empty-card">No completions logged in this window yet.</p>
          ) : (
            <ul>
              {timelineData
                .filter((item) => item.completed > 0)
                .map((item) => (
                  <li key={item.date}>
                    <span>{item.date}</span>
                    <strong>{item.completed}</strong>
                    <span>cleared</span>
                  </li>
                ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  )
}

export default Analytics


