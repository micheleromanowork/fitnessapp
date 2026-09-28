import SwiftUI
import SwiftData

struct ExercisePickerView: View {
    @Environment(\.dismiss) private var dismiss
    @Query(sort: \Exercise.nameIt) private var exercises: [Exercise]
    @State private var searchText = ""

    let onSelect: (String) -> Void

    private var filtered: [Exercise] {
        if searchText.isEmpty { return exercises }
        return exercises.filter {
            $0.nameIt.localizedCaseInsensitiveContains(searchText) ||
            ($0.primaryMuscles.first ?? "").localizedCaseInsensitiveContains(searchText)
        }
    }

    private var grouped: [(String, [Exercise])] {
        let byMuscle = Dictionary(grouping: filtered) { $0.primaryMuscles.first?.capitalized ?? "Altro" }
        return byMuscle.sorted { $0.key < $1.key }
    }

    var body: some View {
        NavigationStack {
            List {
                ForEach(grouped, id: \.0) { muscle, exs in
                    Section(muscle) {
                        ForEach(exs) { ex in
                            ExercisePickerRow(exercise: ex) {
                                onSelect(ex.id)
                                dismiss()
                            }
                        }
                    }
                }
            }
            .listStyle(.insetGrouped)
            .navigationTitle("Scegli Esercizio")
            .navigationBarTitleDisplayMode(.inline)
            .searchable(text: $searchText, prompt: "Cerca esercizio o muscolo")
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Annulla") { dismiss() }
                }
            }
        }
    }
}

private struct ExercisePickerRow: View {
    let exercise: Exercise
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            VStack(alignment: .leading, spacing: Spacing.xs) {
                Text(exercise.nameIt)
                    .font(.bodyMedium)
                    .foregroundStyle(.appTextPrimary)

                HStack(spacing: Spacing.xs) {
                    if let muscle = exercise.primaryMuscles.first {
                        Text(muscle.capitalized)
                            .font(.caption)
                            .foregroundStyle(.appTextSecondary)
                    }
                    if !exercise.equipmentId.isEmpty && exercise.equipmentId != "bodyweight" {
                        Text("·")
                            .foregroundStyle(.appTextTertiary)
                        Text(exercise.equipmentId.capitalized)
                            .font(.caption)
                            .foregroundStyle(.appTextTertiary)
                    }
                }
            }
            .padding(.vertical, Spacing.xs)
        }
    }
}
