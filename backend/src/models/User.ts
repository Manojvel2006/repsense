import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  height?: number;
  weight?: number;
  fitnessGoal?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    age: {
      type: Number,
      min: [13, 'Age must be at least 13'],
      max: [120, 'Invalid age'],
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    height: {
      type: Number,
      min: [50, 'Height must be at least 50 cm'],
      max: [300, 'Height cannot exceed 300 cm'],
    },
    weight: {
      type: Number,
      min: [20, 'Weight must be at least 20 kg'],
      max: [500, 'Weight cannot exceed 500 kg'],
    },
    fitnessGoal: {
      type: String,
      trim: true,
      maxlength: [200, 'Fitness goal cannot exceed 200 characters'],
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.set('toJSON', {
  transform: (_doc: unknown, ret: unknown) => {
    const obj = ret as Record<string, unknown>;
    delete obj.password;
    delete obj.__v;
    return obj;
  },
});

export const User = mongoose.model<IUser>('User', userSchema);