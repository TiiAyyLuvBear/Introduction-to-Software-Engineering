import 'dotenv/config'
import mongoose from 'mongoose'
import { seedDefaultCategories } from './utils/seedDefaultCategories.js'

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/moneylover'
  await mongoose.connect(uri)

  const result = await seedDefaultCategories()
  console.log('Seeded default categories')
  console.log({
    inserted: result.upsertedCount || 0,
    updated: result.modifiedCount || 0,
    matched: result.matchedCount || 0,
  })

  await mongoose.disconnect()
}

main().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
