import express from 'express'
import { requireAuth } from '@clerk/express'
import { z } from 'zod'
import Question from '../models/Question.js'
import {
  REVIEW_OFFSETS,
  buildQuestionDocument,
  formatDate,
  serializeQuestion,
} from '../utils/questionHelpers.js'

const router = express.Router()
const clerkAuth = requireAuth()


router.get('/', clerkAuth, async (req, res, next) => {
  try {
    const { userId } = req.auth
    const questions = await Question.find({ userId }).sort({ addedOn: -1, createdAt: -1 })
    res.json({ data: questions.map(serializeQuestion) })
  } catch (error) {
    next(error)
  }
})

const createSchema = z.object({
  url: z.string().url('Provide a valid LeetCode problem URL'),
})

router.post('/', clerkAuth, async (req, res, next) => {
  try {
    const { userId } = req.auth
    const payload = createSchema.parse(req.body)
    const today = formatDate(new Date())
    const newQuestion = buildQuestionDocument({
      url: payload.url,
      today,
      userId,
    })

    const existing = await Question.findOne({ userId, slug: newQuestion.slug })
    if (existing) {
      return res.status(409).json({
        error: 'duplicate',
        message: 'You are already tracking this problem.',
      })
    }

    const created = await Question.create(newQuestion)
    res.status(201).json({ data: serializeQuestion(created) })
  } catch (error) {
    if (error.code === 'INVALID_URL') {
      return res.status(400).json({ error: 'invalid_url', message: error.message })
    }
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'validation_error', message: error.errors[0].message })
    }
    next(error)
  }
})

const reviewTypeSet = new Set(REVIEW_OFFSETS.map((item) => item.type))

router.patch('/:id/reviews/:type', clerkAuth, async (req, res, next) => {
  try {
    const { userId } = req.auth
    const { id, type } = req.params

    if (!reviewTypeSet.has(type)) {
      return res.status(400).json({ error: 'invalid_review', message: 'Unknown review type.' })
    }

    const today = formatDate(new Date())
    const question = await Question.findOne({ _id: id, userId })

    if (!question) {
      return res.status(404).json({ error: 'not_found', message: 'Question not found.' })
    }

    const review = question.reviews.find((item) => item.type === type)

    if (!review) {
      return res.status(404).json({ error: 'not_found', message: 'Review not found.' })
    }

    if (review.dueOn > today) {
      return res.status(400).json({ error: 'too_early', message: 'Cannot complete a review before it is due.' })
    }

    review.completedOn = review.completedOn ? null : today
    await question.save()

    res.json({ data: serializeQuestion(question) })
  } catch (error) {
    next(error)
  }
})

export default router
