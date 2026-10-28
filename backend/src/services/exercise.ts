import { Exercise, IExercise, ExerciseType } from '../models/Exercise';
import { NotFoundError, ConflictError } from '../utils/errors';

export interface ExerciseFilters {
  type?: ExerciseType;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedExercises {
  exercises: IExercise[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const createExercise = async (data: Partial<IExercise>): Promise<IExercise> => {
  const existing = await Exercise.findOne({ type: data.type });
  if (existing) {
    throw new ConflictError('Exercise with this type already exists', 'EXERCISE_EXISTS');
  }
  return Exercise.create(data);
};

export const getExerciseById = async (id: string): Promise<IExercise> => {
  const exercise = await Exercise.findById(id);
  if (!exercise) {
    throw new NotFoundError('Exercise not found', 'EXERCISE_NOT_FOUND');
  }
  return exercise;
};

export const getExerciseByType = async (type: ExerciseType): Promise<IExercise> => {
  const exercise = await Exercise.findOne({ type });
  if (!exercise) {
    throw new NotFoundError('Exercise not found', 'EXERCISE_NOT_FOUND');
  }
  return exercise;
};

export const listExercises = async (filters: ExerciseFilters): Promise<PaginatedExercises> => {
  const { type, difficulty, isActive, page = 1, limit = 20 } = filters;
  
  const query: Record<string, unknown> = {};
  if (type) query.type = type;
  if (difficulty) query.difficulty = difficulty;
  if (isActive !== undefined) query.isActive = isActive;

  const [exercises, total] = await Promise.all([
    Exercise.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Exercise.countDocuments(query),
  ]);

  return {
    exercises,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const updateExercise = async (id: string, updates: Partial<IExercise>): Promise<IExercise> => {
  const exercise = await Exercise.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });
  if (!exercise) {
    throw new NotFoundError('Exercise not found', 'EXERCISE_NOT_FOUND');
  }
  return exercise;
};

export const deleteExercise = async (id: string): Promise<void> => {
  const exercise = await Exercise.findByIdAndDelete(id);
  if (!exercise) {
    throw new NotFoundError('Exercise not found', 'EXERCISE_NOT_FOUND');
  }
};

export const seedDefaultExercises = async (): Promise<void> => {
  const defaultExercises: Partial<IExercise>[] = [
    {
      type: 'BICEP_CURL',
      name: 'Bicep Curl',
      description: 'Classic arm exercise targeting the biceps brachii muscle.',
      muscleGroups: ['biceps', 'forearms'],
      difficulty: 'beginner',
      instructions: [
        'Stand with feet shoulder-width apart, holding dumbbells at your sides',
        'Keep elbows close to your torso',
        'Curl the weights up while contracting your biceps',
        'Lower slowly with control',
      ],
      formCues: [
        'Keep elbows stationary',
        'Don\'t swing the weights',
        'Full range of motion',
        'Control the eccentric phase',
      ],
      isActive: true,
    },
    {
      type: 'SQUAT',
      name: 'Squat',
      description: 'Fundamental lower body exercise targeting quadriceps, glutes, and hamstrings.',
      muscleGroups: ['quadriceps', 'glutes', 'hamstrings', 'core'],
      difficulty: 'beginner',
      instructions: [
        'Stand with feet slightly wider than shoulder-width',
        'Lower hips back and down as if sitting in a chair',
        'Keep chest up and knees tracking over toes',
        'Drive through heels to return to standing',
      ],
      formCues: [
        'Knees don\'t cave inward',
        'Weight in heels',
        'Chest proud',
        'Hip crease below knee',
      ],
      isActive: false,
    },
    {
      type: 'PUSH_UP',
      name: 'Push-up',
      description: 'Upper body pressing exercise targeting chest, shoulders, and triceps.',
      muscleGroups: ['chest', 'shoulders', 'triceps', 'core'],
      difficulty: 'beginner',
      instructions: [
        'Start in plank position with hands slightly wider than shoulders',
        'Lower body until chest nearly touches floor',
        'Push back up to starting position',
        'Maintain straight line from head to heels',
      ],
      formCues: [
        'Elbows at 45-degree angle',
        'Core engaged',
        'Full range of motion',
        'Don\'t sag hips',
      ],
      isActive: false,
    },
    {
      type: 'SHOULDER_PRESS',
      name: 'Shoulder Press',
      description: 'Overhead pressing movement targeting deltoids and triceps.',
      muscleGroups: ['shoulders', 'triceps', 'upper chest'],
      difficulty: 'intermediate',
      instructions: [
        'Stand or sit with weights at shoulder height',
        'Press weights overhead until arms are extended',
        'Lower with control to starting position',
      ],
      formCues: [
        'Don\'t arch lower back',
        'Press straight up',
        'Lock out at top',
        'Control the descent',
      ],
      isActive: false,
    },
    {
      type: 'LATERAL_RAISE',
      name: 'Lateral Raise',
      description: 'Isolation exercise targeting the lateral deltoid.',
      muscleGroups: ['shoulders'],
      difficulty: 'beginner',
      instructions: [
        'Stand with dumbbells at sides',
        'Raise arms out to sides until parallel to floor',
        'Lower slowly with control',
      ],
      formCues: [
        'Slight bend in elbows',
        'Lead with elbows',
        'Don\'t shrug shoulders',
        'Control both phases',
      ],
      isActive: false,
    },
    {
      type: 'TRICEP_EXTENSION',
      name: 'Tricep Extension',
      description: 'Isolation exercise targeting the triceps brachii.',
      muscleGroups: ['triceps'],
      difficulty: 'beginner',
      instructions: [
        'Hold weight overhead with both hands',
        'Lower behind head by bending elbows',
        'Extend arms back to starting position',
      ],
      formCues: [
        'Keep elbows close to head',
        'Don\'t flare elbows',
        'Full extension at top',
        'Control the negative',
      ],
      isActive: false,
    },
  ];

  for (const ex of defaultExercises) {
    const exists = await Exercise.findOne({ type: ex.type });
    if (!exists) {
      await Exercise.create(ex);
    }
  }
};