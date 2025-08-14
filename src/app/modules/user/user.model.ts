import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { model, Schema } from 'mongoose';
import config from '../../../config';
import { IUser, UserModal } from './user.interface';
import AppError from '../../errors/AppError';
import { STATUS, USER_ROLES } from '../../../enums/user';

const subscriptionSchema = new Schema(
  {
    plan: {
      type: String,
      default: 'free',
    },
    status: {
      type: String,
      enum: [
        'active',
        'cancelled',
        'past_due',
        'unpaid',
        'incomplete',
        'trialing',
        'expired',
      ],
      default: 'incomplete',
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'usd',
      lowercase: true,
    },
    interval: {
      type: String,
      enum: ['day', 'week', 'month', 'year'],
      default: 'month',
    },
    autoRenew: {
      type: Boolean,
      default: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
    stripeSubscriptionId: {
      type: String,
      sparse: true,
      index: true,
    },
    stripeCustomerId: {
      type: String,
      sparse: true,
      index: true,
    },
    stripePriceId: {
      type: String,
    },
    trialEndDate: {
      type: Date,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    _id: false,
    timestamps: false,
  },
);

const userSchema = new Schema<IUser, UserModal>(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    image: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.USER,
    },
    status: {
      type: String,
      enum: Object.values(STATUS),
      default: STATUS.ACTIVE,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    phoneNumber: {
      type: String,
      default: '',
      trim: true,
    },
    phoneCountryCode: {
      type: String,
      default: '',
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    isSubscribed: {
      type: Boolean,
      default: false,
      index: true,
    },
    subscription: subscriptionSchema,
    authentication: {
      type: {
        isResetPassword: {
          type: Boolean,
          default: false,
        },
        oneTimeCode: {
          type: Number,
          default: null,
        },
        expireAt: {
          type: Date,
          default: null,
        },
      },
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ phoneNumber: 1 });
userSchema.index({ role: 1, status: 1 });
userSchema.index({ 'subscription.stripeCustomerId': 1 });
userSchema.index({ 'subscription.stripeSubscriptionId': 1 });
userSchema.index({ 'subscription.endDate': 1, isSubscribed: 1 });

// Static methods
userSchema.statics.isExistUserById = async function (id: string) {
  return this.findById(id).select('+authentication');
};

userSchema.statics.isExistUserByEmail = async function (email: string) {
  return this.findOne({ email }).select('+authentication');
};

userSchema.statics.isMatchPassword = async function (
  password: string,
  hashPassword: string,
): Promise<boolean> {
  return bcrypt.compare(password, hashPassword);
};

// Pre-save middleware
userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    if (this.isNew) {
      const existingUser = await (this.constructor as UserModal).findOne({
        email: this.email,
      });
      if (existingUser) {
        throw new AppError(StatusCodes.CONFLICT, 'Email already exists');
      }
    }

    // Hash password
    this.password = await bcrypt.hash(
      this.password,
      Number(config.bcrypt_salt_rounds),
    );
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Virtual for subscription status
userSchema.virtual('subscriptionStatus').get(function () {
  if (!this.subscription) return 'none';

  const now = new Date();
  if (
    this.subscription.endDate < now &&
    this.subscription.status !== 'active'
  ) {
    return 'expired';
  }

  return this.subscription.status;
});

export const User = model<IUser, UserModal>('User', userSchema);
