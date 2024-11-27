import mongoose from 'mongoose';

const whitelistSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Whitelist = mongoose.model('Whitelist', whitelistSchema);

export default Whitelist;
