export interface NewExercise {
  id: string
  slug: string
  nameEn: string
  nameIt: string
  descriptionEn?: string | null
  descriptionIt?: string | null
  primaryMuscles: string
  secondaryMuscles: string
  equipmentId: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  movementType: 'push' | 'pull' | 'squat' | 'hinge' | 'carry' | 'rotation' | 'isolation' | 'cardio'
  instructionsEn: string
  instructionsIt: string
  mistakesEn: string
  mistakesIt: string
  tipsEn: string
  tipsIt: string
  breathingEn?: string | null
  breathingIt?: string | null
  alternatives: string
  tags: string
}
