
import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser, UserRole, UserPreferences, VideoQuality } from '../types/user.types';


const userPreferencesSchema = new Schema<UserPreferences>({
  language: {
    type: String,
    default: 'en',
    enum: ['en', 'es'],
  },
  notifications: {
    type: Boolean,
    default: true,
  },
  autoplay: {
    type: Boolean,
    default: true,
  },
  qualityPreference: {
    type: String,
    enum: Object.values(VideoQuality),
    default: VideoQuality.MEDIUM,
  },
}, { _id: false });


const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: false, 
    unique: true,
    sparse: true, 
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
    default: undefined, 
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false, 
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters'],
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters'],
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [13, 'Age must be at least 13 years old'],
    max: [120, 'Age cannot exceed 120 years'],
    validate: {
      validator: Number.isInteger,
      message: 'Age must be a whole number',
    },
  },
  profilePicture: {
    type: String,
    default: '',
  },
  
  resetPasswordToken: {
    type: String,
    default: undefined,
  },
 
  resetPasswordExpires: {
    type: Date,
    default: undefined,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.USER,
  },
  preferences: {
    type: userPreferencesSchema,
    default: () => ({}),
  },
}, {
  timestamps: true,
  toJSON: {
    transform(doc: any, ret: any) {
      delete ret.password;
      return ret;
    },
  },
});


userSchema.pre('save', async function(next: any) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  if (!this.password) {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};


userSchema.methods.generateUsername = async function(): Promise<string> {
  const baseUsername = `${this.firstName}${this.lastName}`.toLowerCase()
    .replace(/[^a-z0-9]/g, '') 
    .substring(0, 20); 
  
  let username = baseUsername;
  let counter = 1;
  
  
  while (await User.findOne({ username, _id: { $ne: this._id } })) {
    username = `${baseUsername}${counter}`;
    counter++;
  }
  
  return username;
};


userSchema.virtual('displayName').get(function(this: any) {
  return this.username || this.fullName;
});


userSchema.virtual('fullName').get(function(this: any) {
  return `${this.firstName} ${this.lastName}`;
});


export const User = mongoose.model<IUser>('User', userSchema);