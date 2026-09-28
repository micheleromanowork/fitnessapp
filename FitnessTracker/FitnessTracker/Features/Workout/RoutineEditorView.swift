import SwiftUI
import SwiftData

struct RoutineEditorView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss
    @Query(sort: \Exercise.nameIt) private var exercises: [Exercise]

    @State private var name: String = ""
    @State private var selectedExerciseIds: [String] = []
    @State private var isShowingPicker = false
    @State private var errorMessage: String?

    var body: some View {
        NavigationStack {
            Form {
                Section("Nome scheda") {
                    TextField("Es. Petto & Tricipiti", text: $name)
                }

                Section {
                    ForEach(selectedExerciseIds, id: \.self) { id in
                        if let ex = exercises.first(where: { $0.id == id }) {
                            HStack {
                                Text(ex.nameIt)
                                    .font(.bodyMedium)
                                Spacer()
                                if let muscle = ex.primaryMuscles.first {
                                    Text(muscle.capitalized)
                                        .font(.caption)
                                        .foregroundStyle(.appTextSecondary)
                                }
                            }
                        }
                    }
                    .onDelete { offsets in
                        selectedExerciseIds.remove(atOffsets: offsets)
                    }
                    .onMove { from, to in
                        selectedExerciseIds.move(fromOffsets: from, toOffset: to)
                    }

                    Button(action: { isShowingPicker = true }) {
                        HStack {
                            Image(systemName: "plus.circle.fill")
                                .foregroundStyle(.appAccent)
                            Text("Aggiungi esercizio")
                                .foregroundStyle(.appAccent)
                        }
                    }
                } header: {
                    Text("Esercizi (\(selectedExerciseIds.count))")
                }

                if let err = errorMessage {
                    Section {
                        Text(err)
                            .foregroundStyle(.appDestructive)
                            .font(.bodySmall)
                    }
                }
            }
            .navigationTitle("Nuova Scheda")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Annulla") { dismiss() }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Salva") { save() }
                        .fontWeight(.semibold)
                        .disabled(name.trimmingCharacters(in: .whitespaces).isEmpty)
                }
                ToolbarItem(placement: .bottomBar) {
                    EditButton()
                }
            }
            .sheet(isPresented: $isShowingPicker) {
                ExercisePickerView { exerciseId in
                    if !selectedExerciseIds.contains(exerciseId) {
                        selectedExerciseIds.append(exerciseId)
                    }
                }
            }
        }
    }

    private func save() {
        let trimmed = name.trimmingCharacters(in: .whitespaces)
        guard !trimmed.isEmpty else {
            errorMessage = "Inserisci un nome per la scheda"
            return
        }
        let routine = Routine(name: trimmed)
        for (i, exId) in selectedExerciseIds.enumerated() {
            let re = RoutineExercise(exerciseId: exId, sortOrder: i)
            routine.exercises.append(re)
            modelContext.insert(re)
        }
        modelContext.insert(routine)
        try? modelContext.save()
        dismiss()
    }
}
