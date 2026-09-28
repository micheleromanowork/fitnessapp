import Foundation
import WidgetKit
import SwiftData

struct WidgetDataService {
    private static let suite = "group.com.fitnessapp.shared"

    static func update(workouts: [Workout]) {
        guard let defaults = UserDefaults(suiteName: suite) else { return }

        let completed = workouts.filter { $0.isCompleted }.sorted { $0.startedAt > $1.startedAt }

        if let last = completed.first {
            defaults.set(last.name, forKey: "widget_lastWorkoutName")
            defaults.set(last.startedAt.timeIntervalSince1970, forKey: "widget_lastWorkoutDate")
        }

        defaults.set(currentStreak(from: completed), forKey: "widget_streak")
        defaults.set(weeklyCount(from: completed), forKey: "widget_weeklyCount")

        WidgetCenter.shared.reloadTimelines(ofKind: "FitnessWidget")
    }

    private static func currentStreak(from workouts: [Workout]) -> Int {
        let cal = Calendar.current
        let today = cal.startOfDay(for: Date())
        let uniqueDays = Array(Set(workouts.map { cal.startOfDay(for: $0.startedAt) })).sorted(by: >)

        guard let first = uniqueDays.first else { return 0 }
        let yesterday = cal.date(byAdding: .day, value: -1, to: today)!
        guard first == today || first == yesterday else { return 0 }

        var streak = 0
        var expected = first
        for day in uniqueDays {
            guard day == expected else { break }
            streak += 1
            expected = cal.date(byAdding: .day, value: -1, to: expected) ?? expected
        }
        return streak
    }

    private static func weeklyCount(from workouts: [Workout]) -> Int {
        let cal = Calendar.current
        let startOfWeek = cal.dateInterval(of: .weekOfYear, for: Date())?.start ?? Date()
        return workouts.filter { $0.startedAt >= startOfWeek }.count
    }
}
