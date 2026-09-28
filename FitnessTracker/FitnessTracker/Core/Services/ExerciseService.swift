import SwiftData
import Foundation

@MainActor
class ExerciseService {

    static func seedIfNeeded(context: ModelContext) {
        let seeded = UserDefaults.standard.bool(forKey: "exerciseDBSeeded_v1")
        guard !seeded else { return }

        do {
            let exercises = try loadExercisesFromBundle()
            for ex in exercises {
                context.insert(ex)
            }
            try context.save()
            UserDefaults.standard.set(true, forKey: "exerciseDBSeeded_v1")
        } catch {
            print("Exercise seeding failed: \(error)")
        }
    }

    static func seedPanattaIfNeeded(context: ModelContext) {
        let seeded = UserDefaults.standard.bool(forKey: "exerciseDBSeeded_panatta_v1")
        guard !seeded else { return }

        do {
            let exercises = try loadExercisesFromResource("panatta")
            for ex in exercises {
                context.insert(ex)
            }
            try context.save()
            UserDefaults.standard.set(true, forKey: "exerciseDBSeeded_panatta_v1")
        } catch {
            print("Panatta seeding failed: \(error)")
        }
    }

    static func loadExercisesFromResource(_ name: String) throws -> [Exercise] {
        guard let url = Bundle.main.url(forResource: name, withExtension: "json",
                                        subdirectory: "ExerciseDatabase") else {
            throw ExerciseError.bundleFileNotFound("\(name).json")
        }
        let data = try Data(contentsOf: url)
        let raw = try JSONDecoder().decode([ExerciseJSON].self, from: data)
        return raw.map { $0.toModel() }
    }

    static func loadExercisesFromBundle() throws -> [Exercise] {
        guard let url = Bundle.main.url(forResource: "exercises", withExtension: "json",
                                        subdirectory: "ExerciseDatabase") else {
            throw ExerciseError.bundleFileNotFound("exercises.json")
        }
        let data = try Data(contentsOf: url)
        let raw = try JSONDecoder().decode([ExerciseJSON].self, from: data)
        return raw.map { $0.toModel() }
    }

    static func fetchAll(context: ModelContext) throws -> [Exercise] {
        let descriptor = FetchDescriptor<Exercise>(sortBy: [SortDescriptor(\.nameIt)])
        return try context.fetch(descriptor)
    }

    static func fetch(id: String, context: ModelContext) throws -> Exercise? {
        var descriptor = FetchDescriptor<Exercise>(predicate: #Predicate { $0.id == id })
        descriptor.fetchLimit = 1
        return try context.fetch(descriptor).first
    }

    // Last performance for an exercise across all workouts
    static func lastPerformance(exerciseId: String, context: ModelContext) throws -> (weightKg: Double, reps: Int)? {
        let descriptor = FetchDescriptor<WorkoutExercise>(
            predicate: #Predicate { $0.exerciseId == exerciseId },
            sortBy: [SortDescriptor(\WorkoutExercise.workout?.startedAt, order: .reverse)]
        )
        let results = try context.fetch(descriptor)
        guard let last = results.first else { return nil }
        guard let lastSet = last.completedSets.last else { return nil }
        return (lastSet.weightKg, lastSet.reps)
    }
}

// MARK: - JSON decoding structs

private struct ExerciseJSON: Decodable {
    let id: String
    let slug: String
    let nameIt: String
    let nameEn: String?
    let descriptionIt: String?
    let primaryMuscles: [String]?
    let secondaryMuscles: [String]?
    let equipmentId: String?
    let difficulty: String?
    let movementType: String?
    let instructionsIt: [String]?
    let mistakesIt: [String]?
    let tipsIt: [String]?
    let breathingIt: String?
    let alternatives: [String]?
    let tags: [String]?

    func toModel() -> Exercise {
        Exercise(
            id: id,
            slug: slug,
            nameIt: nameIt,
            nameEn: nameEn ?? "",
            descriptionIt: descriptionIt,
            primaryMuscles: primaryMuscles ?? [],
            secondaryMuscles: secondaryMuscles ?? [],
            equipmentId: equipmentId ?? "bodyweight",
            difficulty: difficulty ?? "intermediate",
            movementType: movementType ?? "compound",
            instructionsIt: instructionsIt ?? [],
            mistakesIt: mistakesIt ?? [],
            tipsIt: tipsIt ?? [],
            breathingIt: breathingIt,
            alternatives: alternatives ?? [],
            tags: tags ?? [],
            defaultRestSeconds: 90,
            isCustom: false
        )
    }
}

enum ExerciseError: Error {
    case bundleFileNotFound(String)
}
