import db from './client'
import { muscles, equipment, exercises } from './schema'
import { MUSCLES } from './seed-data/muscles'
import { EQUIPMENT } from './seed-data/equipment'
import { CHEST_EXERCISES } from './seed-data/exercises-chest'
import { BACK_EXERCISES } from './seed-data/exercises-back'
import { SHOULDER_EXERCISES } from './seed-data/exercises-shoulders'
import { ARM_EXERCISES } from './seed-data/exercises-arms'
import { LEG_EXERCISES } from './seed-data/exercises-legs'
import { CORE_EXERCISES } from './seed-data/exercises-core'
import { CARDIO_EXERCISES } from './seed-data/exercises-cardio'
import { chestExercises2 } from './seed-data/exercises-chest2'
import { backExercises2 } from './seed-data/exercises-back2'
import { legsExercises2 } from './seed-data/exercises-legs2'
import { shouldersExercises2 } from './seed-data/exercises-shoulders2'
import { armsExercises2 } from './seed-data/exercises-arms2'
import { coreExercises2 } from './seed-data/exercises-core2'
import { cardioExercises2 } from './seed-data/exercises-cardio2'

export const ALL_EXERCISES = [
  ...CHEST_EXERCISES,
  ...BACK_EXERCISES,
  ...SHOULDER_EXERCISES,
  ...ARM_EXERCISES,
  ...LEG_EXERCISES,
  ...CORE_EXERCISES,
  ...CARDIO_EXERCISES,
  ...chestExercises2,
  ...backExercises2,
  ...legsExercises2,
  ...shouldersExercises2,
  ...armsExercises2,
  ...coreExercises2,
  ...cardioExercises2,
]

export async function runSeed() {
  for (const muscle of MUSCLES) {
    await db.insert(muscles).values(muscle).onConflictDoNothing()
  }
  for (const eq of EQUIPMENT) {
    await db.insert(equipment).values(eq).onConflictDoNothing()
  }
  let inserted = 0
  for (const exercise of ALL_EXERCISES) {
    try {
      await db.insert(exercises).values(exercise).onConflictDoNothing()
      inserted++
    } catch { /* skip duplicates */ }
  }
  return { muscles: MUSCLES.length, equipment: EQUIPMENT.length, exercises: inserted }
}

// CLI entry point
if (process.argv[1] === import.meta.url?.replace('file://', '')) {
  runSeed()
    .then(r => console.log('✅ Seed complete:', r))
    .catch(err => { console.error('❌ Seed failed:', err); process.exit(1) })
}
