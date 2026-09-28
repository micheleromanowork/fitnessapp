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
        var streak = 0
        var checkDate = cal.startOfDay(for: Date())

        for w in workouts {
            let day = cal.startOfDay(for: w.startedAt)
            if day == checkDate || (streak == 0 && cal.isDateInYesterday(day)) {
                if day != checkDate { checkDate = day }
                streak += 1
                checkDate = cal.date(byAdding: .day, value: -1, to: checkDate) ?? checkDate
            } else if day < checkDate {
                break
            }
        }
        return streak
    }

    private static func weeklyCount(from workouts: [Workout]) -> Int {
        let cal = Calendar.current
        let startOfWeek = cal.dateInterval(of: .weekOfYear, for: Date())?.start ?? Date()
        return workouts.filter { $0.startedAt >= startOfWeek }.count
    }
}
