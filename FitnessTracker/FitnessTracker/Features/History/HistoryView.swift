import SwiftUI
import SwiftData

struct HistoryView: View {
    @Query(
        filter: #Predicate<Workout> { $0.completedAt != nil },
        sort: \Workout.startedAt,
        order: .reverse
    ) private var workouts: [Workout]

    @Query(sort: \Exercise.nameIt) private var exercises: [Exercise]

    var body: some View {
        NavigationStack {
            Group {
                if workouts.isEmpty {
                    emptyState
                } else {
                    workoutList
                }
            }
            .navigationTitle("Storico")
        }
    }

    private var emptyState: some View {
        VStack(spacing: Spacing.lg) {
            Image(systemName: "clock.arrow.circlepath")
                .font(.system(size: 64))
                .foregroundStyle(.appInactive)

            Text("Nessun allenamento")
                .font(.titleMedium)
                .foregroundStyle(.appTextPrimary)

            Text("I tuoi allenamenti completati appariranno qui")
                .font(.bodyMedium)
                .foregroundStyle(.appTextSecondary)
                .multilineTextAlignment(.center)
        }
        .padding(Spacing.xl)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private var workoutList: some View {
        ScrollView {
            LazyVStack(spacing: Spacing.sm) {
                ForEach(workouts) { workout in
                    WorkoutHistoryRow(workout: workout, exercises: exercises)
                }
            }
            .padding(.horizontal, Spacing.md)
            .padding(.vertical, Spacing.md)
        }
    }
}

private struct WorkoutHistoryRow: View {
    let workout: Workout
    let exercises: [Exercise]

    private var duration: String {
        guard let end = workout.completedAt else { return "—" }
        return end.timeIntervalSince(workout.startedAt).durationString
    }

    private var totalSets: Int {
        workout.exercises.reduce(0) { $0 + $1.sets.filter { $0.isCompleted }.count }
    }

    private var exerciseNames: String {
        let sorted = workout.exercises.sorted { $0.sortOrder < $1.sortOrder }
        let names = sorted.prefix(3).compactMap { we in
            exercises.first { $0.id == we.exerciseId }?.nameIt
        }
        let remaining = sorted.count - names.count
        var result = names.joined(separator: ", ")
        if remaining > 0 { result += " +\(remaining)" }
        return result
    }

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.sm) {
            HStack {
                Text(workout.name)
                    .font(.titleSmall)
                    .foregroundStyle(.appTextPrimary)
                Spacer()
                Text(workout.startedAt.workoutDateString)
                    .font(.caption)
                    .foregroundStyle(.appTextTertiary)
            }

            HStack(spacing: Spacing.lg) {
                Label(duration, systemImage: "clock")
                Label("\(workout.exercises.count) esercizi", systemImage: "dumbbell")
                Label("\(totalSets) serie", systemImage: "checkmark.circle")
            }
            .font(.bodySmall)
            .foregroundStyle(.appTextSecondary)

            if !exerciseNames.isEmpty {
                Text(exerciseNames)
                    .font(.caption)
                    .foregroundStyle(.appTextTertiary)
                    .lineLimit(1)
            }
        }
        .padding(Spacing.md)
        .background(.appSurface1, in: RoundedRectangle(cornerRadius: CornerRadius.md))
    }
}
