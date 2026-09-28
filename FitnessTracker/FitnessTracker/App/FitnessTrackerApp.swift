import SwiftUI
import SwiftData

@main
struct FitnessTrackerApp: App {
    let container: ModelContainer

    init() {
        do {
            container = try ModelContainer(for:
                Exercise.self,
                Routine.self,
                RoutineExercise.self,
                Workout.self,
                WorkoutExercise.self,
                CompletedSet.self,
                AppSettings.self
            )
            Task { @MainActor in
                ExerciseService.seedIfNeeded(context: container.mainContext)
                ExerciseService.seedPanattaIfNeeded(context: container.mainContext)
            }
        } catch {
            fatalError("Impossibile creare ModelContainer: \(error)")
        }
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .modelContainer(container)
    }
}
