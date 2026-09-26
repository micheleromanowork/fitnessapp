import { sql } from 'drizzle-orm'
import {
  text, integer, real, sqliteTable, uniqueIndex, index,
} from 'drizzle-orm/sqlite-core'

// ── Auth (NextAuth adapter) ───────────────────────────────────────────────────
export const users = sqliteTable('users', {
  id:            text('id').primaryKey(),
  name:          text('name'),
  email:         text('email').notNull(),
  emailVerified: integer('email_verified', { mode: 'timestamp_ms' }),
  image:         text('image'),
  createdAt:     integer('created_at', { mode: 'timestamp_ms' }).default(sql`(unixepoch()*1000)`),
})

export const accounts = sqliteTable('accounts', {
  userId:            text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type:              text('type').notNull(),
  provider:          text('provider').notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  refreshToken:      text('refresh_token'),
  accessToken:       text('access_token'),
  expiresAt:         integer('expires_at'),
  tokenType:         text('token_type'),
  scope:             text('scope'),
  idToken:           text('id_token'),
  sessionState:      text('session_state'),
}, t => ({ pk: uniqueIndex('acc_provider_idx').on(t.provider, t.providerAccountId) }))

export const sessions = sqliteTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId:       text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires:      integer('expires', { mode: 'timestamp_ms' }).notNull(),
})

export const verificationTokens = sqliteTable('verification_tokens', {
  identifier: text('identifier').notNull(),
  token:      text('token').notNull(),
  expires:    integer('expires', { mode: 'timestamp_ms' }).notNull(),
}, t => ({ pk: uniqueIndex('vt_idx').on(t.identifier, t.token) }))

// ── Profile ───────────────────────────────────────────────────────────────────
export const profiles = sqliteTable('profiles', {
  id:                  text('id').primaryKey(),
  userId:              text('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  age:                 integer('age'),
  gender:              text('gender'),
  heightCm:            real('height_cm'),
  weightKg:            real('weight_kg'),
  goal:                text('goal'),   // muscle_gain|fat_loss|recomposition|strength|general_fitness|endurance|maintenance
  level:               text('level'),  // beginner|intermediate|advanced
  weeklyFrequency:     integer('weekly_frequency'),
  sessionDurationMin:  integer('session_duration_min'),
  equipment:           text('equipment'),           // JSON string[]
  preferredExercises:  text('preferred_exercises'), // JSON string[]
  excludedExercises:   text('excluded_exercises'),  // JSON string[]
  priorityMuscles:     text('priority_muscles'),    // JSON string[]
  physicalLimitations: text('physical_limitations'),
  language:            text('language').default('it'),
  units:               text('units').default('metric'),
  theme:               text('theme').default('dark'),
  defaultRestSec:      integer('default_rest_sec').default(90),
  autoStartTimer:      integer('auto_start_timer', { mode: 'boolean' }).default(true),
  onboardingDone:      integer('onboarding_done', { mode: 'boolean' }).default(false),
  updatedAt:           integer('updated_at', { mode: 'timestamp_ms' }).default(sql`(unixepoch()*1000)`),
})

// ── Reference data ────────────────────────────────────────────────────────────
export const muscles = sqliteTable('muscles', {
  id:       text('id').primaryKey(),
  nameEn:   text('name_en').notNull(),
  nameIt:   text('name_it').notNull(),
  group:    text('group').notNull(),    // upper_body|lower_body|core
  bodyPart: text('body_part').notNull(),
})

export const equipment = sqliteTable('equipment', {
  id:       text('id').primaryKey(),
  nameEn:   text('name_en').notNull(),
  nameIt:   text('name_it').notNull(),
  category: text('category').notNull(), // free_weight|machine|cable|bodyweight|cardio
})

// ── Exercises ─────────────────────────────────────────────────────────────────
export const exercises = sqliteTable('exercises', {
  id:               text('id').primaryKey(),
  slug:             text('slug').notNull().unique(),
  nameEn:           text('name_en').notNull(),
  nameIt:           text('name_it').notNull(),
  descriptionEn:    text('description_en'),
  descriptionIt:    text('description_it'),
  primaryMuscles:   text('primary_muscles').notNull(), // JSON string[]
  secondaryMuscles: text('secondary_muscles'),         // JSON string[]
  equipmentId:      text('equipment_id').references(() => equipment.id),
  difficulty:       text('difficulty').notNull(),      // beginner|intermediate|advanced
  movementType:     text('movement_type').notNull(),   // push|pull|hinge|squat|carry|rotation|isolation|compound
  instructionsEn:   text('instructions_en'),  // JSON string[]
  instructionsIt:   text('instructions_it'),  // JSON string[]
  mistakesEn:       text('mistakes_en'),      // JSON string[]
  mistakesIt:       text('mistakes_it'),      // JSON string[]
  tipsEn:           text('tips_en'),          // JSON string[]
  tipsIt:           text('tips_it'),          // JSON string[]
  breathingEn:      text('breathing_en'),
  breathingIt:      text('breathing_it'),
  alternatives:     text('alternatives'),     // JSON string[] (exercise IDs)
  videoUrl:         text('video_url'),
  imageUrl:         text('image_url'),
  tags:             text('tags'),             // JSON string[]
  isCustom:         integer('is_custom', { mode: 'boolean' }).default(false),
  createdByUserId:  text('created_by_user_id').references(() => users.id),
  createdAt:        integer('created_at', { mode: 'timestamp_ms' }).default(sql`(unixepoch()*1000)`),
}, t => ({ slugIdx: uniqueIndex('ex_slug_idx').on(t.slug) }))

// ── Programs ──────────────────────────────────────────────────────────────────
export const workoutPrograms = sqliteTable('workout_programs', {
  id:              text('id').primaryKey(),
  userId:          text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name:            text('name').notNull(),
  description:     text('description'),
  goal:            text('goal'),
  level:           text('level'),
  daysPerWeek:     integer('days_per_week'),
  durationMin:     integer('duration_min'),
  isActive:        integer('is_active', { mode: 'boolean' }).default(false),
  isArchived:      integer('is_archived', { mode: 'boolean' }).default(false),
  isAiGenerated:   integer('is_ai_generated', { mode: 'boolean' }).default(false),
  createdAt:       integer('created_at', { mode: 'timestamp_ms' }).default(sql`(unixepoch()*1000)`),
  updatedAt:       integer('updated_at', { mode: 'timestamp_ms' }).default(sql`(unixepoch()*1000)`),
})

export const programDays = sqliteTable('program_days', {
  id:          text('id').primaryKey(),
  programId:   text('program_id').notNull().references(() => workoutPrograms.id, { onDelete: 'cascade' }),
  name:        text('name').notNull(),
  dayOrder:    integer('day_order').notNull(),
  targetMuscles: text('target_muscles'), // JSON string[]
  durationMin: integer('duration_min'),
  notes:       text('notes'),
})

export const templateExercises = sqliteTable('template_exercises', {
  id:               text('id').primaryKey(),
  programDayId:     text('program_day_id').notNull().references(() => programDays.id, { onDelete: 'cascade' }),
  exerciseId:       text('exercise_id').notNull().references(() => exercises.id),
  exerciseOrder:    integer('exercise_order').notNull(),
  supersetGroupId:  text('superset_group_id'),
  supersetOrder:    integer('superset_order'),
  setsTarget:       integer('sets_target').default(3),
  repsMin:          integer('reps_min'),
  repsMax:          integer('reps_max'),
  weightKg:         real('weight_kg'),
  rpe:              real('rpe'),
  rir:              integer('rir'),
  restSec:          integer('rest_sec'),
  notes:            text('notes'),
})

// ── Workouts (completed sessions) ────────────────────────────────────────────
export const workouts = sqliteTable('workouts', {
  id:            text('id').primaryKey(),
  userId:        text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  programId:     text('program_id').references(() => workoutPrograms.id),
  programDayId:  text('program_day_id').references(() => programDays.id),
  name:          text('name').notNull(),
  startedAt:     integer('started_at', { mode: 'timestamp_ms' }).notNull(),
  completedAt:   integer('completed_at', { mode: 'timestamp_ms' }),
  durationSec:   integer('duration_sec'),
  totalVolumeKg: real('total_volume_kg'),
  totalSets:     integer('total_sets'),
  notes:         text('notes'),
  isCompleted:   integer('is_completed', { mode: 'boolean' }).default(false),
  createdAt:     integer('created_at', { mode: 'timestamp_ms' }).default(sql`(unixepoch()*1000)`),
}, t => ({ userIdx: index('workout_user_idx').on(t.userId) }))

export const workoutExercises = sqliteTable('workout_exercises', {
  id:              text('id').primaryKey(),
  workoutId:       text('workout_id').notNull().references(() => workouts.id, { onDelete: 'cascade' }),
  exerciseId:      text('exercise_id').notNull().references(() => exercises.id),
  exerciseOrder:   integer('exercise_order').notNull(),
  supersetGroupId: text('superset_group_id'),
  supersetOrder:   integer('superset_order'),
  restSec:         integer('rest_sec'),
  notes:           text('notes'),
})

export const sets = sqliteTable('sets', {
  id:               text('id').primaryKey(),
  workoutExId:      text('workout_ex_id').notNull().references(() => workoutExercises.id, { onDelete: 'cascade' }),
  setOrder:         integer('set_order').notNull(),
  setType:          text('set_type').notNull().default('normal'), // normal|warmup|drop_set|failure|amrap|rest_pause
  weightKg:         real('weight_kg'),
  reps:             integer('reps'),
  rpe:              real('rpe'),
  rir:              integer('rir'),
  durationSec:      integer('duration_sec'),
  isCompleted:      integer('is_completed', { mode: 'boolean' }).default(false),
  isPr:             integer('is_pr', { mode: 'boolean' }).default(false),
  notes:            text('notes'),
  completedAt:      integer('completed_at', { mode: 'timestamp_ms' }),
})

// ── Personal Records ──────────────────────────────────────────────────────────
export const personalRecords = sqliteTable('personal_records', {
  id:          text('id').primaryKey(),
  userId:      text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  exerciseId:  text('exercise_id').notNull().references(() => exercises.id),
  type:        text('type').notNull(), // weight|reps|volume|estimated_1rm
  value:       real('value').notNull(),
  weightKg:    real('weight_kg'),
  reps:        integer('reps'),
  workoutId:   text('workout_id').references(() => workouts.id),
  achievedAt:  integer('achieved_at', { mode: 'timestamp_ms' }).notNull(),
  createdAt:   integer('created_at', { mode: 'timestamp_ms' }).default(sql`(unixepoch()*1000)`),
}, t => ({ idx: index('pr_user_ex_idx').on(t.userId, t.exerciseId, t.type) }))

// ── Body Measurements ─────────────────────────────────────────────────────────
export const bodyMeasurements = sqliteTable('body_measurements', {
  id:              text('id').primaryKey(),
  userId:          text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  measuredAt:      integer('measured_at', { mode: 'timestamp_ms' }).notNull(),
  weightKg:        real('weight_kg'),
  bodyFatPct:      real('body_fat_pct'),
  chestCm:         real('chest_cm'),
  waistCm:         real('waist_cm'),
  hipsCm:          real('hips_cm'),
  shouldersCm:     real('shoulders_cm'),
  leftArmCm:       real('left_arm_cm'),
  rightArmCm:      real('right_arm_cm'),
  leftThighCm:     real('left_thigh_cm'),
  rightThighCm:    real('right_thigh_cm'),
  leftCalfCm:      real('left_calf_cm'),
  rightCalfCm:     real('right_calf_cm'),
  notes:           text('notes'),
  createdAt:       integer('created_at', { mode: 'timestamp_ms' }).default(sql`(unixepoch()*1000)`),
})

// ── Progress Photos ───────────────────────────────────────────────────────────
export const progressPhotos = sqliteTable('progress_photos', {
  id:         text('id').primaryKey(),
  userId:     text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  photoType:  text('photo_type').notNull(), // front|side|back|custom
  url:        text('url').notNull(),
  takenAt:    integer('taken_at', { mode: 'timestamp_ms' }).notNull(),
  notes:      text('notes'),
  weightKg:   real('weight_kg'),
  createdAt:  integer('created_at', { mode: 'timestamp_ms' }).default(sql`(unixepoch()*1000)`),
})

// ── AI ────────────────────────────────────────────────────────────────────────
export const aiConversations = sqliteTable('ai_conversations', {
  id:        text('id').primaryKey(),
  userId:    text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title:     text('title'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).default(sql`(unixepoch()*1000)`),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).default(sql`(unixepoch()*1000)`),
})

export const aiMessages = sqliteTable('ai_messages', {
  id:             text('id').primaryKey(),
  conversationId: text('conversation_id').notNull().references(() => aiConversations.id, { onDelete: 'cascade' }),
  role:           text('role').notNull(), // user|assistant|system
  content:        text('content').notNull(),
  createdAt:      integer('created_at', { mode: 'timestamp_ms' }).default(sql`(unixepoch()*1000)`),
})

export const aiInsights = sqliteTable('ai_insights', {
  id:        text('id').primaryKey(),
  userId:    text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type:      text('type').notNull(), // progress|suggestion|warning
  contentIt: text('content_it').notNull(),
  contentEn: text('content_en').notNull(),
  metadata:  text('metadata'), // JSON
  expiresAt: integer('expires_at', { mode: 'timestamp_ms' }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).default(sql`(unixepoch()*1000)`),
})

// ── Types ─────────────────────────────────────────────────────────────────────
export type User = typeof users.$inferSelect
export type Profile = typeof profiles.$inferSelect
export type Exercise = typeof exercises.$inferSelect
export type Muscle = typeof muscles.$inferSelect
export type Equipment = typeof equipment.$inferSelect
export type WorkoutProgram = typeof workoutPrograms.$inferSelect
export type ProgramDay = typeof programDays.$inferSelect
export type TemplateExercise = typeof templateExercises.$inferSelect
export type Workout = typeof workouts.$inferSelect
export type WorkoutExercise = typeof workoutExercises.$inferSelect
export type Set = typeof sets.$inferSelect
export type PersonalRecord = typeof personalRecords.$inferSelect
export type BodyMeasurement = typeof bodyMeasurements.$inferSelect
export type AiConversation = typeof aiConversations.$inferSelect
export type AiMessage = typeof aiMessages.$inferSelect
export type AiInsight = typeof aiInsights.$inferSelect
