import { useEffect, useMemo, useState } from "react"
import { useAuth, useUser } from "@clerk/clerk-react"
import {
  REVIEW_OFFSETS,
  addDays,
  buildCadenceSummary,
  buildDateWindow,
  buildTimelineData,
  computeStreak,
  extractTitleFromUrl,
  getToday,
  sanitizeDeep,
  sanitizeText,
} from "./dashboardUtils.js"
import { DashboardDataContext } from "./DashboardContext.jsx"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"
const STORAGE_KEY = "leet-track.dashboard.questions"

const DashboardProvider = ({ children }) => {
  const { getToken, isLoaded: authLoaded } = useAuth()
  const { user, isLoaded: userLoaded } = useUser()
  const [questions, setQuestions] = useState(() => {
    if (typeof window === "undefined") {
      return []
    }
    try {
      const cached = window.localStorage.getItem(STORAGE_KEY)
      if (!cached) {
        return []
      }
      const parsed = JSON.parse(cached)
      return Array.isArray(parsed) ? parsed : []
    } catch (error) {
      console.error("Failed to read stored dashboard state", error)
      return []
    }
  })
  const [urlInput, setUrlInput] = useState("")
  const [feedback, setFeedback] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [activeReview, setActiveReview] = useState(null)
  const today = useMemo(() => getToday(), [])

  useEffect(() => {
    if (!authLoaded) {
      return
    }

    let isMounted = true

    const loadQuestions = async () => {
      try {
        setLoading(true)
        const token = await getToken()
        if (!token) {
          throw new Error("Missing auth token")
        }
        const response = await fetch(`${API_BASE_URL}/api/questions`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({}))
          const cleanedMessage = sanitizeText(errorBody.message || "Unable to fetch questions") || "Unable to fetch questions"
          throw new Error(cleanedMessage)
        }
        const payload = await response.json()
        if (!isMounted) {
          return
        }
        const rawData = Array.isArray(payload.data) ? payload.data : []
        const sanitizedData = sanitizeDeep(rawData)
        const normalized = sanitizedData.map((item) => ({
          ...item,
          id: item.id || item._id,
          reviews: Array.isArray(item.reviews) ? item.reviews : [],
        }))
        setQuestions(normalized)
      } catch (error) {
        console.error("Failed to load questions", error)
        if (isMounted) {
          setFeedback({ type: "error", message: "Unable to fetch your log right now. Try again shortly." })
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadQuestions()

    return () => {
      isMounted = false
    }
  }, [authLoaded, getToken])

  useEffect(() => {
    if (!feedback) {
      return undefined
    }
    const timer = setTimeout(() => setFeedback(null), 4000)
    return () => clearTimeout(timer)
  }, [feedback])

  const reviewItems = useMemo(
    () =>
      questions.flatMap((question) =>
        (question.reviews || []).map((review) => ({
          ...review,
          questionId: question.id,
          questionTitle: question.title,
          questionUrl: question.url,
          addedOn: question.addedOn,
        })),
      ),
    [questions],
  )

  const todaysGroups = useMemo(
    () =>
      REVIEW_OFFSETS.map((offset) => ({
        ...offset,
        items: reviewItems
          .filter((item) => item.type === offset.type && !item.completedOn && item.dueOn === today)
          .sort((a, b) => a.questionTitle.localeCompare(b.questionTitle)),
      })),
    [reviewItems, today],
  )

  const pendingItems = useMemo(
    () =>
      reviewItems
        .filter((item) => !item.completedOn && item.dueOn < today)
        .sort((a, b) => a.dueOn.localeCompare(b.dueOn)),
    [reviewItems, today],
  )

  const upcomingItems = useMemo(
    () =>
      reviewItems
        .filter((item) => !item.completedOn && item.dueOn > today)
        .sort((a, b) => a.dueOn.localeCompare(b.dueOn))
        .slice(0, 8),
    [reviewItems, today],
  )

  const todaysDueCount = todaysGroups.reduce((sum, group) => sum + group.items.length, 0)
  const completedTodayCount = reviewItems.filter((item) => item.dueOn === today && item.completedOn).length
  const pendingCount = pendingItems.length

  const totalReviews = reviewItems.length
  const totalCompleted = reviewItems.filter((item) => item.completedOn).length
  const completionRate = totalReviews ? Math.round((totalCompleted / totalReviews) * 100) : 0

  const last7DaysBoundary = addDays(today, -6)
  const recentCompletions = reviewItems.filter(
    (item) => item.completedOn && item.completedOn >= last7DaysBoundary && item.completedOn <= today,
  ).length

  const upcomingWeekCount = reviewItems.filter(
    (item) => !item.completedOn && item.dueOn > today && item.dueOn <= addDays(today, 7),
  ).length

  const currentStreak = useMemo(() => computeStreak(reviewItems, today), [reviewItems, today])

  const dateWindow = useMemo(() => buildDateWindow(today), [today])
  const timelineData = useMemo(() => buildTimelineData(reviewItems, dateWindow), [reviewItems, dateWindow])
  const cadenceSummary = useMemo(() => buildCadenceSummary(reviewItems), [reviewItems])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (submitting) {
      return
    }
    const trimmed = urlInput.trim()
    if (!trimmed) {
      setFeedback({ type: "error", message: "Paste a LeetCode problem URL first." })
      return
    }

    const { slug } = extractTitleFromUrl(trimmed)
    if (!slug) {
      setFeedback({
        type: "error",
        message: "Could not read the problem slug. Use a LeetCode URL like https://leetcode.com/problems/two-sum/.",
      })
      return
    }

    if (questions.some((item) => item.slug === slug)) {
      setFeedback({ type: "error", message: "You are already tracking this problem." })
      return
    }

    try {
      setSubmitting(true)
      const token = await getToken()
      if (!token) {
        throw new Error("Missing auth token")
      }

      const response = await fetch(`${API_BASE_URL}/api/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url: trimmed }),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        const message = sanitizeText(body.message || "Could not save this problem.") || "Could not save this problem."
        setFeedback({ type: "error", message })
        return
      }

      const payload = await response.json()
      if (!payload?.data) {
        throw new Error("Malformed response from server")
      }

      const sanitizedQuestion = sanitizeDeep(payload.data)
      const normalizedQuestion = {
        ...sanitizedQuestion,
        id: sanitizedQuestion.id || sanitizedQuestion._id,
        reviews: Array.isArray(sanitizedQuestion.reviews) ? sanitizedQuestion.reviews : [],
      }

      setQuestions((prev) => [normalizedQuestion, ...prev])
      setUrlInput("")
      const safeTitle = sanitizeText(normalizedQuestion.title || "problem")
      setFeedback({ type: "success", message: `Saved "${safeTitle}" to your log.` })
    } catch (error) {
      console.error("Failed to submit question", error)
      setFeedback({ type: "error", message: "Unexpected error while saving. Try again." })
    } finally {
      setSubmitting(false)
    }
  }

  const toggleReviewStatus = async (questionId, reviewType) => {
    const key = `${questionId}:${reviewType}`
    if (activeReview === key) {
      return
    }
    try {
      setActiveReview(key)
      const token = await getToken()
      if (!token) {
        throw new Error("Missing auth token")
      }
      const response = await fetch(`${API_BASE_URL}/api/questions/${questionId}/reviews/${reviewType}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        const message = sanitizeText(body.message || "Unable to update this review.") || "Unable to update this review."
        setFeedback({ type: "error", message })
        return
      }

      const payload = await response.json()
      if (!payload?.data) {
        throw new Error("Malformed response from server")
      }

      const sanitizedUpdate = sanitizeDeep(payload.data)
      const normalizedUpdate = {
        ...sanitizedUpdate,
        id: sanitizedUpdate.id || sanitizedUpdate._id,
        reviews: Array.isArray(sanitizedUpdate.reviews) ? sanitizedUpdate.reviews : [],
      }

      setQuestions((prev) => prev.map((item) => (item.id === normalizedUpdate.id ? normalizedUpdate : item)))
    } catch (error) {
      console.error("Failed to toggle review status", error)
      setFeedback({ type: "error", message: "Unexpected error while updating. Try again." })
    } finally {
      setActiveReview(null)
    }
  }

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(questions))
    } catch (error) {
      console.error("Failed to persist dashboard state", error)
    }
  }, [questions])

  useEffect(() => {
    if (!userLoaded) {
      return
    }
    if (!user) {
      setQuestions([])
      if (typeof window !== "undefined") {
        try {
          window.localStorage.removeItem(STORAGE_KEY)
        } catch (error) {
          console.error("Failed to clear dashboard state", error)
        }
      }
    }
  }, [user, userLoaded])

  const displayName = useMemo(() => {
    if (!user) return ""

    let raw = ""
    if (user.fullName) {
      raw = user.fullName
    } else if (user.firstName || user.lastName) {
      raw = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
    } else {
      raw = user.primaryEmailAddress?.emailAddress ?? ""
    }

    return sanitizeText(raw)
  }, [user])

  const value = {
    today,
    loading,
    submitting,
    feedback,
    setFeedback,
    urlInput,
    setUrlInput,
    handleSubmit,
    toggleReviewStatus,
    activeReview,
    questions,
    reviewItems,
    todaysGroups,
    pendingItems,
    upcomingItems,
    timelineData,
    cadenceSummary,
    stats: {
      todaysDueCount,
      completedTodayCount,
      pendingCount,
      totalReviews,
      totalCompleted,
      completionRate,
      recentCompletions,
      upcomingWeekCount,
      currentStreak,
    },
    displayName,
    userLoaded,
  }

  return <DashboardDataContext.Provider value={value}>{children}</DashboardDataContext.Provider>
}

export default DashboardProvider


