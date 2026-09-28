import SwiftData
import SwiftUI

@Observable
class ProgressViewModel {
    var weeklyVolumes: [StatsService.WeeklyVolume] = []
    var exerciseHistory: [StatsService.SessionPoint] = []
    var aggregateStats: StatsService.AggregateStats = .empty
    var comparison: StatsService.SessionComparison?

    var selectedExerciseId:   String?
    var selectedExerciseName: String?
    var isShowingExercisePicker = false
    var isLoadingChart = false

    // MARK: - Load

    func loadAll(context: ModelContext) {
        weeklyVolumes  = (try? StatsService.weeklyVolume(context: context)) ?? []
        aggregateStats = (try? StatsService.aggregateStats(context: context)) ?? .empty
        if selectedExerciseId != nil { loadExercise(context: context) }
    }

    func selectExercise(id: String, name: String?, context: ModelContext) {
        selectedExerciseId   = id
        selectedExerciseName = name
        loadExercise(context: context)
    }

    // MARK: - Private

    private func loadExercise(context: ModelContext) {
        guard let id = selectedExerciseId else { return }
        isLoadingChart  = true
        exerciseHistory = (try? StatsService.exerciseHistory(exerciseId: id, context: context)) ?? []
        comparison      = try? StatsService.sessionComparison(exerciseId: id, exerciseName: selectedExerciseName, context: context)
        isLoadingChart  = false
    }
}
