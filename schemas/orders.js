import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',  // Związanie z kolekcją 'Users'
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending'
  },
  items: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Items'  // Związanie z kolekcją 'Items'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default orderSchema;
