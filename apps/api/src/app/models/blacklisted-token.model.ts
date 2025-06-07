import mongoose from 'mongoose';

const BlacklistedTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
});

BlacklistedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const BlacklistedTokenModel = mongoose.model('BlacklistedToken', BlacklistedTokenSchema);

// ✅ THIS IS THE IMPORTANT PART
export { BlacklistedTokenModel };
