import SwiftData
import Foundation

@MainActor
class StatsService {

    // MARK: - Types

    struct WeeklyVolume: Identifiable {
        let id: Date
        let weekStart: Date
        let volumeKg: Double
        let label: String
    }

    struct SessionPoint: Identifiable {
        let id: Date
        let date: Date
        let maxWeightKg: Double
        let totalVolumeKg: Double
    }

    struct AggregateStats {
        let totalWorkouts: Int
        let totalHours: Double
        let totalSets: Int
        let totalVolumeKg: Double

        static let empty = AggregateStats(totalWorkouts: 0, totalHours: 0, totalSets: 0, totalVolumeKg: 0)
    }

    struct SessionComparison {
        let exerciseName: String?
        let current: Double   // volume kg last session
        let previous: Double  // volume kg session before
        var delta: Double { current - previous }
        var deltaPercent: Double {
            guard previous > 0 else { return 0 }
            return (delta / previous) * 100
        }
    }

    // MARK: - Weekly Volume (last 8 weeks)

    static func weeklyVolume(context: ModelContext) throws -> [WeeklyVolume] {
        let descriptor = FetchDescriptor<Workout>(
            predicate: #Predicate { $0.completedAt != nil }
        )
        let workouts = try context.fetch(descriptor)
        let cal = Calendar.current
        let now = Date()

        return (0..<8).reversed().compactMap { offset -> WeeklyVolume? in
            guard
                let weekStart = cal.date(byAdding: .weekOfYear, value: -offset, to: cal.weekStart(for: now)),
                let weekEnd   = cal.date(byAdding: .day, value: 7, to: weekStart)
            else { return nil }

            let vol = workouts
                .filter { w in
                    guard let c = w.completedAt else { return false }
                    return c >= weekStart && c < weekEnd
                }
                .reduce(0.0) { $0 + $1.totalVolumeKg }

            let fmt = DateFormatter()
            fmt.locale = Locale(identifier: "it_IT")
            fmt.dateFormat = "dd/MM"
            return WeeklyVolume(id: weekStart, weekStart: weekStart, volumeKg: vol, label: fmt.string(from: weekStart))
        }
    }

    // MARK: - Max weight per session for an exercise

    static func exerciseHistory(exerciseId: String, context: ModelContext) throws -> [SessionPoint] {
        let descriptor = FetchDescriptor<Workout>(
            predicate: #Predicate { $0.completedAt != nil },
            sortBy: [SortDescriptor(\.startedAt)]
        )
        let workouts = try context.fetch(descriptor)
        var points: [SessionPoint] = []

        for workout in workouts {
            guard let date = workout.completedAt else { continue }
            let completed = workout.exercises
                .filter { $0.exerciseId == exerciseId }
                .flatMap { $0.completedSets }
            guard !completed.isEmpty else { continue }
            let maxW = completed.map(\.weightKg).max() ?? 0
            let vol  = completed.reduce(0.0) { $0 + $1.volume }
            guard maxW > 0 else { continue }
            points.append(SessionPoint(id: date, date: date, maxWeightKg: maxW, totalVolumeKg: vol))
        }
        return points
    }

    // MARK: - Aggregate stats

    static func aggregateStats(context: ModelContext) throws -> AggregateStats {
        let descriptor = FetchDescriptor<Workout>(
            predicate: #Predicate { $0.completedAt != nil }
        )
        let workouts = try context.fetch(descriptor)
        return AggregateStats(
            totalWorkouts: workouts.count,
            totalHours:    workouts.compactMap(\.duration).reduce(0, +) / 3600,
            totalSets:     workouts.reduce(0)   { $0 + $1.totalSets },
            totalVolumeKg: workouts.reduce(0.0) { $0 + $1.totalVolumeKg }
        )
    }

    // MARK: - Session comparison (last 2 workouts for an exercise)

    static func sessionComparison(exerciseId: String, exerciseName: String?, context: ModelContext) throws -> SessionComparison? {
        let points = try exerciseHistory(exerciseId: exerciseId, context: context)
        guard points.count >= 2 else { return nil }
        let last = points[points.count - 1]
        let prev = points[points.count - 2]
        return SessionComparison(
            exerciseName: exerciseName,
            current:  last.totalVolumeKg,
            previous: prev.totalVolumeKg
        )
    }
}

// MARK: - Calendar helper

private extension Calendar {
    func weekStart(for date: Date) -> Date {
        let comps = dateComponents([.yearForWeekOfYear, .weekOfYear], from: date)
        return self.date(from: comps) ?? date
    }
}
