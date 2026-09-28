import WidgetKit
import SwiftUI

// MARK: - Shared data via App Groups
// Requires "group.com.fitnessapp.shared" App Group on both targets in Xcode.

private let sharedDefaults = UserDefaults(suiteName: "group.com.fitnessapp.shared")

private struct WidgetData {
    let streak: Int
    let lastWorkoutName: String
    let lastWorkoutDate: Date?
    let weeklyCount: Int

    static var current: WidgetData {
        let streak = sharedDefaults?.integer(forKey: "widget_streak") ?? 0
        let name = sharedDefaults?.string(forKey: "widget_lastWorkoutName") ?? "Nessun allenamento"
        let ts = sharedDefaults?.double(forKey: "widget_lastWorkoutDate") ?? 0
        let date = ts > 0 ? Date(timeIntervalSince1970: ts) : nil
        let weekly = sharedDefaults?.integer(forKey: "widget_weeklyCount") ?? 0
        return WidgetData(streak: streak, lastWorkoutName: name, lastWorkoutDate: date, weeklyCount: weekly)
    }

    static var placeholder: WidgetData {
        WidgetData(streak: 5, lastWorkoutName: "Petto + Tricipiti", lastWorkoutDate: Date(), weeklyCount: 3)
    }
}

// MARK: - Timeline

struct FitnessEntry: TimelineEntry {
    let date: Date
    let data: WidgetData
}

struct FitnessProvider: TimelineProvider {
    func placeholder(in context: Context) -> FitnessEntry {
        FitnessEntry(date: Date(), data: .placeholder)
    }

    func getSnapshot(in context: Context, completion: @escaping (FitnessEntry) -> Void) {
        completion(FitnessEntry(date: Date(), data: context.isPreview ? .placeholder : .current))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<FitnessEntry>) -> Void) {
        let entry = FitnessEntry(date: Date(), data: .current)
        let next = Calendar.current.date(byAdding: .hour, value: 1, to: Date()) ?? Date()
        completion(Timeline(entries: [entry], policy: .after(next)))
    }
}

// MARK: - Views

struct FitnessWidgetSmallView: View {
    let entry: FitnessEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Image(systemName: "flame.fill")
                    .foregroundStyle(.orange)
                Text("\(entry.data.streak)")
                    .font(.title2.bold())
                    .foregroundStyle(.primary)
                Text("giorni")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            Spacer()
            Text(entry.data.lastWorkoutName)
                .font(.caption.weight(.medium))
                .foregroundStyle(.primary)
                .lineLimit(2)
            if let d = entry.data.lastWorkoutDate {
                Text(d, style: .relative)
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }
        }
        .padding()
        .containerBackground(.background, for: .widget)
    }
}

struct FitnessWidgetMediumView: View {
    let entry: FitnessEntry

    var body: some View {
        HStack(spacing: 16) {
            VStack(alignment: .leading, spacing: 6) {
                HStack(spacing: 4) {
                    Image(systemName: "flame.fill")
                        .foregroundStyle(.orange)
                    Text("\(entry.data.streak) giorni")
                        .font(.headline)
                }
                Text(entry.data.lastWorkoutName)
                    .font(.subheadline.weight(.medium))
                    .lineLimit(1)
                if let d = entry.data.lastWorkoutDate {
                    Text(d, style: .relative)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            Spacer()
            VStack(spacing: 4) {
                Text("\(entry.data.weeklyCount)")
                    .font(.title.bold())
                    .foregroundStyle(.blue)
                Text("questa\nsettimana")
                    .font(.caption2)
                    .multilineTextAlignment(.center)
                    .foregroundStyle(.secondary)
            }
        }
        .padding()
        .containerBackground(.background, for: .widget)
    }
}

// MARK: - Widget

struct FitnessWidget: Widget {
    let kind = "FitnessWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: FitnessProvider()) { entry in
            FitnessWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Fitness Tracker")
        .description("Streak e ultimo allenamento.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

struct FitnessWidgetEntryView: View {
    @Environment(\.widgetFamily) private var family
    let entry: FitnessEntry

    var body: some View {
        switch family {
        case .systemMedium:
            FitnessWidgetMediumView(entry: entry)
        default:
            FitnessWidgetSmallView(entry: entry)
        }
    }
}
