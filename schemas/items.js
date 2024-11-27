import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  price: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  available: {
    type: Boolean,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default itemSchema;
