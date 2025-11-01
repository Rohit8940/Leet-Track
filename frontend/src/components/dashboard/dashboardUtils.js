export const REVIEW_OFFSETS = [
  { type: "day3", label: "3-Day Review", days: 3 },
  { type: "day7", label: "7-Day Review", days: 7 },
  { type: "day15", label: "15-Day Review", days: 15 },
]

const ASCII_REPLACEMENTS = [
  { regex: /[\u2012-\u2015\u2212]/g, replacement: "-" },
  { regex: /[\u2018\u2019\u201A\u201B\u2032\u2035]/g, replacement: "'" },
  { regex: /[\u201C\u201D\u201E\u201F\u2033\u2036]/g, replacement: "\"" },
  { regex: /[\u2022\u2023\u25E6\u2043\u2219]/g, replacement: "-" },
  { regex: /[\u2026]/g, replacement: "..." },
  { regex: /[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, replacement: " " },
]

const CONTROL_CHARS_REGEX = /[\u0000-\u0008\u000B-\u001F\u007F-\u009F]/g
const NON_ASCII_PRINTABLE_REGEX = /[^\x09\x0A\x0D\x20-\x7E]/g

export const sanitizeText = (value) => {
  if (typeof value !== "string") {
    return value
  }

  let sanitized = value.normalize("NFKD")

  ASCII_REPLACEMENTS.forEach(({ regex, replacement }) => {
    sanitized = sanitized.replace(regex, replacement)
  })

  sanitized = sanitized.replace(CONTROL_CHARS_REGEX, "")
  sanitized = sanitized.replace(NON_ASCII_PRINTABLE_REGEX, "")

  return sanitized
}

export const sanitizeDeep = (input) => {
  if (Array.isArray(input)) {
    return input.map(sanitizeDeep)
  }

  if (input && typeof input === "object") {
    return Object.fromEntries(Object.entries(input).map(([key, value]) => [key, sanitizeDeep(value)]))
  }

  return sanitizeText(input)
}

export const LABEL_LOOKUP = REVIEW_OFFSETS.reduce((acc, item) => {
  acc[item.type] = item.label
  return acc
}, {})

export const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export const getToday = () => formatDate(new Date())

export const toDate = (value) => {
  const [year, month, day] = value.split("-").map(Number)
  return new Date(year, month - 1, day)
}

export const addDays = (dateStr, days) => {
  const date = toDate(dateStr)
  date.setDate(date.getDate() + days)
  return formatDate(date)
}

export const daysBetween = (from, to) => {
  const fromDate = toDate(from)
  const toDateValue = toDate(to)
  const diff = toDateValue.getTime() - fromDate.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export const formatDisplayDate = (dateStr) => {
  if (!dateStr) return "-"
  const date = toDate(dateStr)
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

export const formatFullDate = (dateStr) => {
  const date = toDate(dateStr)
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  })
}

const capitalize = (word) => (word ? word[0].toUpperCase() + word.slice(1) : "")

export const extractTitleFromUrl = (rawUrl) => {
  try {
    const url = new URL(rawUrl.trim())
    const path = url.pathname.toLowerCase()
    const problemSegment = "/problems/"
    const index = path.indexOf(problemSegment)
    if (index === -1) {
      return { slug: "", title: "" }
    }
    const after = path.slice(index + problemSegment.length)
    const slug = after.split("/")[0]
    if (!slug) {
      return { slug: "", title: "" }
    }
    const words = slug.split("-").filter(Boolean).map(capitalize)
    const title = words.length ? words.join(" ") : slug
    return { slug, title }
  } catch {
    return { slug: "", title: "" }
  }
}

export const statusForReview = (review, today) => {
  if (review.completedOn) {
    return {
      text: `Done ${formatDisplayDate(review.completedOn)}`,
      className: "is-done",
    }
  }
  if (review.dueOn < today) {
    return {
      text: "Pending",
      className: "is-pending",
    }
  }
  if (review.dueOn === today) {
    return {
      text: "Due today",
      className: "is-due",
    }
  }
  return {
    text: `Due ${formatDisplayDate(review.dueOn)}`,
    className: "is-upcoming",
  }
}

export const TIMELINE_WINDOW = 14

export const buildDateWindow = (today) => {
  const baseDate = toDate(today)
  const sequence = []
  for (let offset = TIMELINE_WINDOW - 1; offset >= 0; offset -= 1) {
    const cursor = new Date(baseDate)
    cursor.setDate(cursor.getDate() - offset)
    const iso = formatDate(cursor)
    sequence.push({
      iso,
      label: cursor.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      full: cursor.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }),
    })
  }
  return sequence
}

export const buildTimelineData = (reviews, dateWindow) => {
  const dueMap = new Map()
  const doneMap = new Map()
  const windowSet = new Set(dateWindow.map((item) => item.iso))

  reviews.forEach((item) => {
    if (windowSet.has(item.dueOn)) {
      dueMap.set(item.dueOn, (dueMap.get(item.dueOn) || 0) + 1)
    }
    if (item.completedOn && windowSet.has(item.completedOn)) {
      doneMap.set(item.completedOn, (doneMap.get(item.completedOn) || 0) + 1)
    }
  })

  return dateWindow.map((item) => ({
    date: item.label,
    due: dueMap.get(item.iso) || 0,
    completed: doneMap.get(item.iso) || 0,
    tooltipLabel: item.full,
  }))
}

export const buildCadenceSummary = (reviews) =>
  REVIEW_OFFSETS.map((offset, index) => {
    const typed = reviews.filter((item) => item.type === offset.type)
    const total = typed.length || 1
    const completed = typed.filter((item) => item.completedOn).length
    return {
      name: offset.label,
      progress: Math.round((completed / total) * 100),
      completed,
      remaining: total - completed,
      fill: ["#38bdf8", "#a855f7", "#f97316"][index % 3],
    }
  })

export const computeStreak = (reviews, today) => {
  let streak = 0
  let cursor = new Date(toDate(today))
  let hasCompletion = true

  while (hasCompletion) {
    const iso = formatDate(cursor)
    hasCompletion = reviews.some((item) => item.completedOn === iso)
    if (hasCompletion) {
      streak += 1
      cursor.setDate(cursor.getDate() - 1)
    }
  }

  return streak
}
