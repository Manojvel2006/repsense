import mongoose, { Document, Schema } from 'mongoose';

export type FormStatus = 'CORRECT_CURL' | 'PARTIAL_CURL' | 'FAST_CURL' | 'INCORRECT_FORM' | 'NO_EXERCISE';

export interface IWorkout extends Document {
  userId: mongoose.Types.ObjectId;
  exerciseType: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  totalReps: number;
  correctReps: number;
  partialReps: number;
  fastReps: number;
  incorrectReps: number;
  formAccuracy: number;
  averageHeartRate: number;
  maxHeartRate: number;
  averageSpO2: number;
  estimatedCalories: number;
  synced: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const workoutSchema = new Schema<IWorkout>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    exerciseType: {
      type: String,
      required: true,
      trim: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 0,
    },
    totalReps: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    correctReps: {
      type: Number,
      min: 0,
      default: 0,
    },
    partialReps: {
      type: Number,
      min: 0,
      default: 0,
    },
    fastReps: {
      type: Number,
      min: 0,
      default: 0,
    },
    incorrectReps: {
      type: Number,
      min: 0,
      default: 0,
    },
    formAccuracy: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    averageHeartRate: {
      type: Number,
      min: 0,
      max: 300,
    },
    maxHeartRate: {
      type: Number,
      min: 0,
      max: 300,
    },
    averageSpO2: {
      type: Number,
      min: 0,
      max: 100,
    },
    estimatedCalories: {
      type: Number,
      min: 0,
      default: 0,
    },
    synced: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

workoutSchema.index({ userId: 1, startTime: -1 });
workoutSchema.index({ userId: 1, exerciseType: 1 });

export const Workout = mongoose.model<IWorkout>('Workout', workoutSchema);