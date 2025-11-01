import { useDashboardData } from "./DashboardContext.jsx"
import { LABEL_LOOKUP, formatDisplayDate } from "./dashboardUtils.js"

const Overview = () => {
  const {
    loading,
    stats,
    handleSubmit,
    submitting,
    urlInput,
    setUrlInput,
    feedback,
    todaysGroups,
    toggleReviewStatus,
    activeReview,
  } = useDashboardData()

  return (
    <div className="dashboard-surface">
      {loading && <div className="sync-banner">Synchronizing your mission log...</div>}

      <section className="insight-grid">
        <article className="insight-card">
          <div className="insight-glyph" aria-hidden="true" />
          <div className="insight-meta">
            <span>Today&apos;s reviews</span>
            <h2>{stats.todaysDueCount}</h2>
            <p>{stats.completedTodayCount} completed so far</p>
          </div>
        </article>
        <article className="insight-card">
          <div className="insight-glyph insight-glyph--violet" aria-hidden="true" />
          <div className="insight-meta">
            <span>Pending catch-ups</span>
            <h2>{stats.pendingCount}</h2>
            <p>Overdue checkpoints awaiting attention</p>
          </div>
        </article>
        <article className="insight-card">
          <div className="insight-glyph insight-glyph--sky" aria-hidden="true" />
          <div className="insight-meta">
            <span>Current streak</span>
            <h2>{stats.currentStreak} day{stats.currentStreak === 1 ? "" : "s"}</h2>
            <p>{stats.recentCompletions} completions this week</p>
          </div>
        </article>
        <article className="insight-card">
          <div className="insight-glyph insight-glyph--amber" aria-hidden="true" />
          <div className="insight-meta">
            <span>Next 7 days</span>
            <h2>{stats.upcomingWeekCount}</h2>
            <p>Reviews scheduled in the coming week</p>
          </div>
        </article>
      </section>

      <section className="action-grid">
        <article className="panel capture-panel">
          <div className="panel-header">
            <div>
              <h3>Log today&apos;s victory</h3>
              <p>Paste the LeetCode URL -- we capture the title, set the cadence, and track it forever.</p>
            </div>
          </div>
          <form className="capture-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <input
                type="url"
                inputMode="url"
                placeholder="https://leetcode.com/problems/two-sum/"
                value={urlInput}
                onChange={(event) => setUrlInput(event.target.value)}
                aria-label="LeetCode problem URL"
                disabled={submitting}
              />
              <button type="submit" disabled={submitting}>
                {submitting ? "Scheduling..." : "Add to tracker"}
              </button>
            </div>
            {feedback && (
              <p className={`form-feedback ${feedback.type === "error" ? "is-error" : "is-success"}`}>
                {feedback.message}
              </p>
            )}
          </form>
        </article>

        <article className="panel focus-panel">
          <div className="panel-header">
            <div>
              <h3>Today&apos;s mission</h3>
              <p>{stats.todaysDueCount === 0 ? "You are clear for launch." : "Check these off to stay on tempo."}</p>
            </div>
          </div>
          {stats.todaysDueCount === 0 ? (
            <div className="empty-card">Nothing due today. Bank the win or clear pending reviews.</div>
          ) : (
            <div className="focus-groups">
              {todaysGroups.map((group) => (
                <div key={group.type} className="focus-group">
                  <header>
                    <span>{group.label}</span>
                    <span>{group.items.length} due</span>
                  </header>
                  {group.items.length === 0 ? (
                    <p className="empty-card mini">No tasks in this window.</p>
                  ) : (
                    <ul>
                      {group.items.map((item) => {
                        const checkboxId = `${item.type}-${item.questionId}`
                        const isBusy = activeReview === `${item.questionId}:${item.type}`
                        return (
                          <li key={checkboxId}>
                            <label htmlFor={checkboxId} className="focus-checkbox">
                              <input
                                id={checkboxId}
                                type="checkbox"
                                checked={Boolean(item.completedOn)}
                                onChange={() => toggleReviewStatus(item.questionId, item.type)}
                                disabled={isBusy}
                              />
                              <span className="checkbox-visual" aria-hidden="true" />
                            </label>
                            <div className="focus-body">
                              <a href={item.questionUrl} target="_blank" rel="noreferrer">
                                {item.questionTitle}
                              </a>
                              <span>Logged {formatDisplayDate(item.addedOn)}</span>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </article>
      </section>
    </div>
  )
}

export default Overview





