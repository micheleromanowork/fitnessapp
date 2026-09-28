import SwiftUI
import SwiftData

struct ExercisePickerView: View {
    @Environment(\.dismiss) private var dismiss
    @Query(sort: \Exercise.nameIt) private var exercises: [Exercise]
    @State private var searchText = ""
    @State private var selectedEquipment: String? = nil

    let onSelect: (String) -> Void

    private let equipmentFilters: [(label: String, id: String?)] = [
        ("Tutti", nil),
        ("Panatta", "panatta"),
        ("Corpo libero", "bodyweight"),
        ("Bilanciere", "barbell"),
        ("Manubri", "dumbbell"),
        ("Cavi", "cable"),
    ]

    private var filtered: [Exercise] {
        var result = exercises
        if let eq = selectedEquipment {
            result = result.filter { $0.equipmentId == eq }
        }
        if !searchText.isEmpty {
            result = result.filter {
                $0.nameIt.localizedCaseInsensitiveContains(searchText) ||
                ($0.primaryMuscles.first ?? "").localizedCaseInsensitiveContains(searchText)
            }
        }
        return result
    }

    private var grouped: [(String, [Exercise])] {
        let byMuscle = Dictionary(grouping: filtered) { $0.primaryMuscles.first?.capitalized ?? "Altro" }
        return byMuscle.sorted { $0.key < $1.key }
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                equipmentFilterBar
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
            }
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

    private var equipmentFilterBar: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: Spacing.xs) {
                ForEach(equipmentFilters, id: \.label) { filter in
                    let isSelected = selectedEquipment == filter.id
                    Button(filter.label) {
                        selectedEquipment = filter.id
                    }
                    .font(.bodySmall)
                    .padding(.horizontal, Spacing.sm)
                    .padding(.vertical, 6)
                    .background(
                        isSelected ? Color.appAccent : Color.appSurface1,
                        in: Capsule()
                    )
                    .foregroundStyle(isSelected ? Color.white : Color.appTextSecondary)
                    .animation(.easeInOut(duration: 0.15), value: isSelected)
                }
            }
            .padding(.horizontal, Spacing.md)
            .padding(.vertical, Spacing.sm)
        }
        .background(Color.appBackground)
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
