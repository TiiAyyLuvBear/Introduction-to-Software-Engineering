import mongoose from 'mongoose'

const AccountSchema = new mongoose.Schema({
  name: { type: String, required: true },
  balance: { type: Number, default: 0 },
  currency: { type: String, default: 'USD' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }
}, { timestamps: true })

export default mongoose.model('Account', AccountSchema)
