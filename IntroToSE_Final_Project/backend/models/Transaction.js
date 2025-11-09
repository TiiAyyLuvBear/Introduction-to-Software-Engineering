import mongoose from 'mongoose'

const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['income','expense'], required: true },
  category: { type: String },
  account: { type: String },
  date: { type: Date, default: Date.now },
  note: { type: String }
}, { timestamps: true })

export default mongoose.model('Transaction', TransactionSchema)
