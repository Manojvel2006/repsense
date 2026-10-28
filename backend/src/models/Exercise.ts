import mongoose, { Document, Schema } from 'mongoose';

export type ExerciseType = 
  | 'BICEP_CURL'
  | 'SQUAT'
  | 'PUSH_UP'
  | 'SHOULDER_PRESS'
  | 'LATERAL_RAISE'
  | 'TRICEP_EXTENSION';

export interface IExercise extends Document {
  type: ExerciseType;
  name: string;
  description: string;
  muscleGroups: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions: string[];
  formCues: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const exerciseSchema = new Schema<IExercise>(
  {
    type: {
      type: String,
      required: true,
      unique: true,
      enum: [
        'BICEP_CURL',
        'SQUAT',
        'PUSH_UP',
        'SHOULDER_PRESS',
        'LATERAL_RAISE',
        'TRICEP_EXTENSION',
      ],
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    muscleGroups: [{
      type: String,
      required: true,
      trim: true,
    }],
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    instructions: [{
      type: String,
      trim: true,
    }],
    formCues: [{
      type: String,
      trim: true,
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Exercise = mongoose.model<IExercise>('Exercise', exerciseSchema);