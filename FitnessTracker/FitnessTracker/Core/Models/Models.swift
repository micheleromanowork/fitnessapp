import SwiftData
import Foundation

// MARK: - Exercise (catalogo)

@Model
class Exercise {
    var id: String
    var slug: String
    var nameIt: String
    var nameEn: String
    var descriptionIt: String?
    var primaryMuscles: [String]
    var secondaryMuscles: [String]
    var equipmentId: String
    var difficulty: String
    var movementType: String
    var instructionsIt: [String]
    var mistakesIt: [String]
    var tipsIt: [String]
    var breathingIt: String?
    var alternatives: [String]
    var tags: [String]
    var defaultRestSeconds: Int
    var isCustom: Bool
    var createdAt: Date

    init(
        id: String,
        slug: String,
        nameIt: String,
        nameEn: String = "",
        descriptionIt: String? = nil,
        primaryMuscles: [String] = [],
        secondaryMuscles: [String] = [],
        equipmentId: String = "bodyweight",
        difficulty: String = "intermediate",
        movementType: String = "compound",
        instructionsIt: [String] = [],
        mistakesIt: [String] = [],
        tipsIt: [String] = [],
        breathingIt: String? = nil,
        alternatives: [String] = [],
        tags: [String] = [],
        defaultRestSeconds: Int = 90,
        isCustom: Bool = false
    ) {
        self.id = id
        self.slug = slug
        self.nameIt = nameIt
        self.nameEn = nameEn
        self.descriptionIt = descriptionIt
        self.primaryMuscles = primaryMuscles
        self.secondaryMuscles = secondaryMuscles
        self.equipmentId = equipmentId
        self.difficulty = difficulty
        self.movementType = movementType
        self.instructionsIt = instructionsIt
        self.mistakesIt = mistakesIt
        self.tipsIt = tipsIt
        self.breathingIt = breathingIt
        self.alternatives = alternatives
        self.tags = tags
        self.defaultRestSeconds = defaultRestSeconds
        self.isCustom = isCustom
        self.createdAt = Date()
    }
}

// MARK: - Routine (scheda)

@Model
class Routine {
    var id: UUID
    var name: String
    var notes: String?
    var sortOrder: Int
    var createdAt: Date
    var updatedAt: Date

    @Relationship(deleteRule: .cascade)
    var exercises: [RoutineExercise]

    init(name: String, notes: String? = nil, sortOrder: Int = 0) {
        self.id = UUID()
        self.name = name
        self.notes = notes
        self.sortOrder = sortOrder
        self.createdAt = Date()
        self.updatedAt = Date()
        self.exercises = []
    }
}

@Model
class RoutineExercise {
    var id: UUID
    var sortOrder: Int
    var targetSets: Int
    var targetRepsMin: Int?
    var targetRepsMax: Int?
    var targetWeight: Double?
    var restSeconds: Int?
    var notes: String?
    var exerciseId: String

    @Relationship(inverse: \Routine.exercises)
    var routine: Routine?

    init(
        exerciseId: String,
        sortOrder: Int = 0,
        targetSets: Int = 3,
        targetRepsMin: Int? = nil,
        targetRepsMax: Int? = nil,
        restSeconds: Int? = nil
    ) {
        self.id = UUID()
        self.exerciseId = exerciseId
        self.sortOrder = sortOrder
        self.targetSets = targetSets
        self.targetRepsMin = targetRepsMin
        self.targetRepsMax = targetRepsMax
        self.restSeconds = restSeconds
    }
}

// MARK: - Workout (sessione)

@Model
class Workout {
    var id: UUID
    var name: String
    var startedAt: Date
    var completedAt: Date?
    var notes: String?
    var routineId: UUID?

    @Relationship(deleteRule: .cascade)
    var exercises: [WorkoutExercise]

    var isCompleted: Bool { completedAt != nil }

    var duration: TimeInterval? {
        guard let completedAt else { return nil }
        return completedAt.timeIntervalSince(startedAt)
    }

    var totalSets: Int {
        exercises.flatMap { $0.sets }.filter { $0.isCompleted }.count
    }

    var totalVolumeKg: Double {
        exercises.flatMap { $0.sets }.filter { $0.isCompleted }.reduce(0.0) { $0 + ($1.weightKg * Double($1.reps)) }
    }

    init(name: String, routineId: UUID? = nil) {
        self.id = UUID()
        self.name = name
        self.routineId = routineId
        self.startedAt = Date()
        self.exercises = []
    }
}

@Model
class WorkoutExercise {
    var id: UUID
    var sortOrder: Int
    var exerciseId: String
    var restSeconds: Int?
    var notes: String?

    @Relationship(deleteRule: .cascade)
    var sets: [CompletedSet]

    @Relationship(inverse: \Workout.exercises)
    var workout: Workout?

    var completedSets: [CompletedSet] {
        sets.filter { $0.isCompleted }.sorted { $0.setNumber < $1.setNumber }
    }

    init(exerciseId: String, sortOrder: Int = 0, restSeconds: Int? = nil) {
        self.id = UUID()
        self.exerciseId = exerciseId
        self.sortOrder = sortOrder
        self.restSeconds = restSeconds
        self.sets = []
    }
}

@Model
class CompletedSet {
    var id: UUID
    var setNumber: Int
    var weightKg: Double
    var reps: Int
    var isCompleted: Bool
    var completedAt: Date?
    var notes: String?

    @Relationship(inverse: \WorkoutExercise.sets)
    var workoutExercise: WorkoutExercise?

    var volume: Double { weightKg * Double(reps) }

    init(setNumber: Int, weightKg: Double = 0, reps: Int = 0) {
        self.id = UUID()
        self.setNumber = setNumber
        self.weightKg = weightKg
        self.reps = reps
        self.isCompleted = false
    }

    func complete(weightKg: Double, reps: Int) {
        self.weightKg = weightKg
        self.reps = reps
        self.isCompleted = true
        self.completedAt = Date()
    }
}

// MARK: - AppSettings

@Model
class AppSettings {
    var id: UUID
    var defaultRestSeconds: Int
    var autoStartTimer: Bool
    var hapticEnabled: Bool
    var theme: String
    var weightUnit: String
    var databaseVersion: Int

    init() {
        self.id = UUID()
        self.defaultRestSeconds = 90
        self.autoStartTimer = true
        self.hapticEnabled = true
        self.theme = "system"
        self.weightUnit = "kg"
        self.databaseVersion = 1
    }
}
