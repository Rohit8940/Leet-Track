import mongoose from 'mongoose'

const connectToDatabase = async () => {
  const uri = process.env.MONGO_URI

  if (!uri) {
    throw new Error('MONGO_URI is not defined in environment variables')
  }

  try {
    mongoose.set('strictQuery', true)
    await mongoose.connect(uri, {
      dbName: process.env.MONGO_DB_NAME || 'leet-track',
    })
    console.log('Connected to MongoDB')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    throw error
  }
}

export default connectToDatabase
