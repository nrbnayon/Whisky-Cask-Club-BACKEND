// src\app\modules\subscription\subscription.model.ts
import mongoose, { model } from 'mongoose';
import { ISubscrition } from './subscription.interface';

const subscriptionSchema = new mongoose.Schema({
  plan: {
    type: String,
    enum: ['free', 'base', 'premium', 'enterprice'],
    default: 'free',
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'cancelled', 'expired', 'incomplete'],
    default: 'active',
  },
  price: { type: Number, default: 0 },
  autoRenew: { type: Boolean, default: false },
  startDate: { type: Date },
  endDate: { type: Date },
  stripeSubscriptionId: { type: String },
  stripeCustomerId: { type: String },
});

const Subscrition = model<ISubscrition>('Subscrition', subscriptionSchema);

export default Subscrition;
