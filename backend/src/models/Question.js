import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    label: { type: String, required: true },
    dueOn: { type: String, required: true },
    completedOn: { type: String, default: null },
  },
  { _id: false },
)

const questionSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    url: { type: String, required: true },
    slug: { type: String, required: true },
    title: { type: String, required: true },
    addedOn: { type: String, required: true },
    reviews: { type: [reviewSchema], default: [] },
  },
  { timestamps: true },
)

questionSchema.index({ userId: 1, slug: 1 }, { unique: true })

const Question = mongoose.model('Question', questionSchema)

export default Question
