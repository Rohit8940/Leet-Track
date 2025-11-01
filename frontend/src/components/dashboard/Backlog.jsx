import { useDashboardData } from "./DashboardContext.jsx"
import {
  LABEL_LOOKUP,
  REVIEW_OFFSETS,
  formatDisplayDate,
  statusForReview,
  daysBetween,
} from "./dashboardUtils.js"

const Backlog = () => {
  const {
    pendingItems,
    upcomingItems,
    questions,
    toggleReviewStatus,
    activeReview,
    today,
  } = useDashboardData()

  return (
    <div className="dashboard-surface">
      <section className="panel pending-panel">
        <div className="panel-header">
          <div>
            <h3>Catch-up queue</h3>
            <p>Clear these overdue checkpoints to restore rhythm.</p>
          </div>
        </div>
        {pendingItems.length === 0 ? (
          <div className="empty-card">No pending reviews -- stellar consistency!</div>
        ) : (
          <ul className="pending-list">
            {pendingItems.map((item) => {
              const daysOverdue = Math.abs(daysBetween(item.dueOn, today))
              const isBusy = activeReview === `${item.questionId}:${item.type}`
              return (
                <li key={`${item.type}-${item.questionId}`}>
                  <button
                    type="button"
                    className="inline-checkbox"
                    onClick={() => toggleReviewStatus(item.questionId, item.type)}
                    aria-label={`Mark ${item.questionTitle} ${LABEL_LOOKUP[item.type]} as done`}
                    disabled={isBusy}
                  >
                    <span className="checkbox-visual" aria-hidden="true" />
                  </button>
                  <div className="pending-meta">
                    <a href={item.questionUrl} target="_blank" rel="noreferrer">
                      {item.questionTitle}
                    </a>
                    <p>
                      {LABEL_LOOKUP[item.type]} - due {formatDisplayDate(item.dueOn)} - {daysOverdue} day
                      {daysOverdue === 1 ? "" : "s"} overdue
                    </p>
                  </div>
                  <button
                    type="button"
                    className="mark-done"
                    onClick={() => toggleReviewStatus(item.questionId, item.type)}
                    disabled={isBusy}
                  >
                    {isBusy ? "Updating..." : "Resolve"}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section className="panel upcoming-panel">
        <div className="panel-header">
          <div>
            <h3>Radar -- next checkpoints</h3>
            <p>Preview what&apos;s about to hit so you can plan your sessions.</p>
          </div>
        </div>
        {upcomingItems.length === 0 ? (
          <div className="empty-card">No upcoming reviews yet. Log more problems to grow your queue.</div>
        ) : (
          <ul className="upcoming-list">
            {upcomingItems.map((item) => (
              <li key={`${item.type}-${item.questionId}`}>
                <div>
                  <span className="upcoming-label">{LABEL_LOOKUP[item.type]}</span>
                  <a href={item.questionUrl} target="_blank" rel="noreferrer">
                    {item.questionTitle}
                  </a>
                </div>
                <span className="upcoming-date">{formatDisplayDate(item.dueOn)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="history-panel panel">
        <div className="panel-header">
          <div>
            <h3>Mission archive</h3>
            <p>Everything you&apos;ve logged, with cadence status at a glance.</p>
          </div>
        </div>
        {questions.length === 0 ? (
          <div className="empty-card">Log your first problem to populate the archive.</div>
        ) : (
          <div className="table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Problem</th>
                  <th>Added</th>
                  {REVIEW_OFFSETS.map((offset) => (
                    <th key={offset.type}>{offset.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {questions.map((question) => (
                  <tr key={question.id}>
                    <td>
                      <a href={question.url} target="_blank" rel="noreferrer">
                        {question.title}
                      </a>
                    </td>
                    <td>{formatDisplayDate(question.addedOn)}</td>
                    {REVIEW_OFFSETS.map((offset) => {
                      const review = question.reviews.find((item) => item.type === offset.type)
                      const status = review ? statusForReview(review, today) : { text: "-", className: "" }
                      return (
                        <td key={`${question.id}-${offset.type}`}>
                          <span className={`status-chip ${status.className}`}>{status.text}</span>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

export default Backlog


