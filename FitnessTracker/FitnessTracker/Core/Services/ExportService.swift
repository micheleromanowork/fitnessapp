import Foundation
import SwiftData

struct ExportService {
    static func exportWorkoutsCSV(workouts: [Workout]) -> String {
        var rows: [String] = [
            "Data,Nome allenamento,Durata (min),Serie completate,Volume totale (kg)"
        ]

        let df = DateFormatter()
        df.dateFormat = "dd/MM/yyyy HH:mm"

        for workout in workouts.filter({ $0.isCompleted }).sorted(by: { $0.startedAt > $1.startedAt }) {
            let date = df.string(from: workout.startedAt)
            let name = workout.name.replacingOccurrences(of: ",", with: ";")
            let duration = workout.duration.map { String(format: "%.0f", $0 / 60) } ?? "—"
            let sets = String(workout.totalSets)
            let volume = String(format: "%.1f", workout.totalVolumeKg)
            rows.append("\(date),\(name),\(duration),\(sets),\(volume)")
        }

        return rows.joined(separator: "\n")
    }

    static func writeToTemp(_ csv: String) -> URL? {
        let url = FileManager.default.temporaryDirectory
            .appendingPathComponent("allenamenti_\(Date().timeIntervalSince1970).csv")
        do {
            try csv.write(to: url, atomically: true, encoding: .utf8)
            return url
        } catch {
            return nil
        }
    }
}
