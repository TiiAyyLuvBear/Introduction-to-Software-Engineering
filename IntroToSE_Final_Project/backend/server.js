import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import cors from 'cors'

import transactionsRouter from './routes/transactions.js'
import categoriesRouter from './routes/categories.js'
import accountsRouter from './routes/accounts.js'
import usersRouter from './routes/users.js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/transactions', transactionsRouter)
app.use('/api/categories', categoriesRouter)
app.use('/api/accounts', accountsRouter)
app.use('/api/users', usersRouter)

app.get('/api/health', (req, res) => res.json({status: 'ok'}))

const PORT = process.env.PORT || 4000

async function start(){
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/moneylover'
  try{
    await mongoose.connect(uri)
    console.log('Connected to MongoDB')
    app.listen(PORT, ()=> console.log('Server running on port', PORT))
  }catch(err){
    console.error('Failed to start', err)
    process.exit(1)
  }
}

start()
