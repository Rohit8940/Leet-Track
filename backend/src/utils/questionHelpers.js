export const REVIEW_OFFSETS = [
  { type: 'day3', label: '3-Day Review', days: 3 },
  { type: 'day7', label: '7-Day Review', days: 7 },
  { type: 'day15', label: '15-Day Review', days: 15 },
]

export const LABEL_LOOKUP = REVIEW_OFFSETS.reduce((acc, item) => {
  acc[item.type] = item.label
  return acc
}, {})

export const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const addDays = (dateStr, days) => {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() + days)
  return formatDate(date)
}

const capitalize = (word) => (word ? word[0].toUpperCase() + word.slice(1) : '')

export const sanitizeProblemUrl = (rawUrl) => {
  try {
    const url = new URL(rawUrl.trim())
    return `${url.origin}${url.pathname}`
  } catch {
    return rawUrl.trim()
  }
}

export const extractTitleFromUrl = (rawUrl) => {
  try {
    const url = new URL(rawUrl.trim())
    const path = url.pathname.toLowerCase()
    const segment = '/problems/'
    const index = path.indexOf(segment)
    if (index === -1) {
      return { slug: '', title: '' }
    }
    const rest = path.slice(index + segment.length)
    const slug = rest.split('/')[0]
    if (!slug) {
      return { slug: '', title: '' }
    }
    const words = slug.split('-').filter(Boolean).map(capitalize)
    const title = words.length ? words.join(' ') : slug
    return { slug, title }
  } catch {
    return { slug: '', title: '' }
  }
}

export const buildQuestionDocument = ({
  url,
  today,
  titleOverride,
  userId,
}) => {
  const sanitizedUrl = sanitizeProblemUrl(url)
  const { slug, title } = extractTitleFromUrl(sanitizedUrl)

  if (!slug) {
    const error = new Error('Could not parse problem slug from URL')
    error.code = 'INVALID_URL'
    throw error
  }

  return {
    userId,
    url: sanitizedUrl,
    slug,
    title: titleOverride || title || slug.replace(/-/g, ' '),
    addedOn: today,
    reviews: REVIEW_OFFSETS.map((offset) => ({
      type: offset.type,
      label: offset.label,
      dueOn: addDays(today, offset.days),
      completedOn: null,
    })),
  }
}

export const serializeQuestion = (doc) => ({
  id: doc.id,
  url: doc.url,
  slug: doc.slug,
  title: doc.title,
  addedOn: doc.addedOn,
  reviews: doc.reviews,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
})
