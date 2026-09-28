import SwiftUI
import SwiftData

struct ActiveWorkoutView: View {
    @Bindable var viewModel: WorkoutViewModel
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss
    @Query private var exercises: [Exercise]

    @FocusState private var focusedField: InputField?
    @State private var isShowingExerciseDetail = false

    private enum InputField: Hashable { case weight, reps }

    var currentExercise: Exercise? {
        guard let id = viewModel.currentExercise?.exerciseId else { return nil }
        return exercises.first { $0.id == id }
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                workoutHeader

                if let we = viewModel.currentExercise {
                    ScrollView {
                        VStack(spacing: Spacing.lg) {
                            exerciseHeader(we: we)
                            inputSection
                            completedSetsSection(we: we)
                            navigationButtons
                        }
                        .padding(Spacing.md)
                    }
                    .scrollDismissesKeyboard(.interactively)
                } else {
                    workoutEmptyState
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Annulla") { viewModel.isShowingFinishAlert = true }
                        .foregroundStyle(.appDestructive)
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Fine") { viewModel.isShowingFinishAlert = true }
                        .fontWeight(.semibold)
                }
                ToolbarItemGroup(placement: .keyboard) {
                    Spacer()
                    Button("Fine") { focusedField = nil }
                        .fontWeight(.semibold)
                }
            }
            .alert("Fine Allenamento", isPresented: $viewModel.isShowingFinishAlert) {
                Button("Completa") {
                    viewModel.finishWorkout()
                    dismiss()
                }
                Button("Annulla allenamento", role: .destructive) {
                    viewModel.cancelWorkout()
                    dismiss()
                }
                Button("Continua", role: .cancel) {}
            } message: {
                Text("Vuoi completare o annullare l'allenamento?")
            }
            .sheet(isPresented: $viewModel.isShowingAddExercise) {
                ExercisePickerView { exerciseId in
                    if let ctx = modelContext as ModelContext?,
                       let workout = viewModel.workout {
                        _ = try? WorkoutService.addExercise(exerciseId: exerciseId, to: workout, context: ctx)
                    }
                }
            }
            .sheet(isPresented: $isShowingExerciseDetail) {
                if let exercise = currentExercise {
                    ExerciseDetailView(exercise: exercise, viewModel: viewModel)
                }
            }
        }
        .overlay(alignment: .bottom) {
            if viewModel.isShowingTimer {
                RestTimerBanner(timer: viewModel.timer) {
                    viewModel.skipTimer()
                }
                .transition(.move(edge: .bottom).combined(with: .opacity))
                .animation(.appSpring, value: viewModel.isShowingTimer)
            }
        }
        .onAppear { viewModel.setup(context: modelContext) }
    }

    // MARK: - Subviews

    private var workoutHeader: some View {
        HStack {
            Text(viewModel.workout?.name ?? "Allenamento")
                .font(.titleSmall)
                .foregroundStyle(.appTextSecondary)
            Spacer()
            WorkoutDurationView(startedAt: viewModel.workout?.startedAt ?? Date())
        }
        .padding(.horizontal, Spacing.md)
        .padding(.vertical, Spacing.sm)
        .background(.appSurface1)
    }

    private func exerciseHeader(we: WorkoutExercise) -> some View {
        VStack(alignment: .leading, spacing: Spacing.xs) {
            Text("Esercizio \(viewModel.currentExerciseIndex + 1) / \(viewModel.exercises.count)")
                .font(.caption)
                .foregroundStyle(.appTextTertiary)

            Button(action: { isShowingExerciseDetail = true }) {
                HStack(spacing: Spacing.xs) {
                    Text(currentExercise?.nameIt ?? we.exerciseId)
                        .font(.titleLarge)
                        .foregroundStyle(.appTextPrimary)
                    Image(systemName: "info.circle")
                        .font(.bodySmall)
                        .foregroundStyle(.appTextTertiary)
                }
            }

            if let muscle = currentExercise?.primaryMuscles.first {
                Text(muscle.capitalized)
                    .font(.bodySmall)
                    .foregroundStyle(.appTextSecondary)
            }

            if let last = viewModel.lastPerformance {
                HStack(spacing: Spacing.xs) {
                    Image(systemName: "clock.arrow.circlepath").font(.caption)
                    Text("Ultima volta: \(formatWeight(last.weightKg))kg × \(last.reps)")
                        .font(.bodySmall)
                }
                .foregroundStyle(.appAccent)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private var inputSection: some View {
        VStack(spacing: Spacing.md) {
            if viewModel.totalSetsForExercise > 0 {
                Text("SERIE \(viewModel.currentSetNumber) / \(viewModel.totalSetsForExercise)")
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundStyle(.appAccent)
                    .frame(maxWidth: .infinity, alignment: .center)
            }

            HStack(spacing: Spacing.lg) {
                VStack(spacing: Spacing.xs) {
                    Text("PESO (kg)")
                        .font(.caption)
                        .foregroundStyle(.appTextTertiary)
                    TextField("0", text: $viewModel.weightInput)
                        .font(.displayMedium)
                        .multilineTextAlignment(.center)
                        .keyboardType(.decimalPad)
                        .focused($focusedField, equals: .weight)
                        .frame(height: 80)
                        .background(
                            focusedField == .weight ? Color.appAccent.opacity(0.08) : Color.appSurface1,
                            in: RoundedRectangle(cornerRadius: CornerRadius.md)
                        )
                        .overlay(
                            RoundedRectangle(cornerRadius: CornerRadius.md)
                                .stroke(focusedField == .weight ? Color.appAccent : Color.clear, lineWidth: 1.5)
                        )
                }

                Text("×")
                    .font(.titleLarge)
                    .foregroundStyle(.appTextTertiary)

                VStack(spacing: Spacing.xs) {
                    Text("REPS")
                        .font(.caption)
                        .foregroundStyle(.appTextTertiary)
                    TextField("0", text: $viewModel.repsInput)
                        .font(.displayMedium)
                        .multilineTextAlignment(.center)
                        .keyboardType(.numberPad)
                        .focused($focusedField, equals: .reps)
                        .frame(height: 80)
                        .background(
                            focusedField == .reps ? Color.appAccent.opacity(0.08) : Color.appSurface1,
                            in: RoundedRectangle(cornerRadius: CornerRadius.md)
                        )
                        .overlay(
                            RoundedRectangle(cornerRadius: CornerRadius.md)
                                .stroke(focusedField == .reps ? Color.appAccent : Color.clear, lineWidth: 1.5)
                        )
                }
            }

            if let err = viewModel.errorMessage {
                HStack(spacing: Spacing.xs) {
                    Image(systemName: "exclamationmark.circle.fill")
                    Text(err)
                }
                .font(.caption)
                .foregroundStyle(.appDestructive)
                .transition(.opacity.combined(with: .move(edge: .top)))
            }

            Button(action: {
                focusedField = nil
                viewModel.completeCurrentSet()
            }) {
                HStack {
                    Image(systemName: "checkmark.circle.fill")
                    Text("Completa Serie")
                }
                .font(.titleSmall)
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, Spacing.md)
                .background(Color.green, in: RoundedRectangle(cornerRadius: CornerRadius.md))
            }
        }
        .animation(.easeInOut(duration: 0.2), value: viewModel.errorMessage)
        .animation(.easeInOut(duration: 0.15), value: focusedField)
    }

    private func completedSetsSection(we: WorkoutExercise) -> some View {
        let completed = we.sets.filter { $0.isCompleted }.sorted { $0.setNumber < $1.setNumber }
        return VStack(alignment: .leading, spacing: Spacing.sm) {
            if !completed.isEmpty {
                Text("Serie completate")
                    .font(.bodySmall)
                    .foregroundStyle(.appTextSecondary)

                ForEach(completed) { set in
                    SetCompletedRow(set: set)
                        .swipeActions(edge: .trailing, allowsFullSwipe: true) {
                            Button(role: .destructive) {
                                viewModel.deleteSet(set)
                            } label: {
                                Label("Elimina", systemImage: "trash")
                            }
                        }
                }
            }

            Button(action: viewModel.addSet) {
                HStack {
                    Image(systemName: "plus")
                    Text("Aggiungi serie")
                }
                .font(.bodyMedium)
                .foregroundStyle(.appAccent)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private var navigationButtons: some View {
        HStack(spacing: Spacing.md) {
            if viewModel.currentExerciseIndex > 0 {
                Button(action: viewModel.goToPreviousExercise) {
                    Image(systemName: "chevron.left")
                        .font(.titleSmall)
                        .foregroundStyle(.appTextSecondary)
                        .frame(width: 44, height: 44)
                        .background(.appSurface1, in: Circle())
                }
            }

            Spacer()

            Button(action: {
                if viewModel.isLastExercise {
                    viewModel.isShowingAddExercise = true
                } else {
                    viewModel.goToNextExercise()
                }
            }) {
                HStack {
                    Text(viewModel.isLastExercise ? "Aggiungi Esercizio" : "Prossimo Esercizio")
                    Image(systemName: viewModel.isLastExercise ? "plus" : "chevron.right")
                }
                .font(.bodyMedium)
                .foregroundStyle(.appAccent)
            }
        }
        .padding(.vertical, Spacing.sm)
    }

    private var workoutEmptyState: some View {
        VStack(spacing: Spacing.lg) {
            Text("Nessun esercizio")
                .font(.titleMedium)
                .foregroundStyle(.appTextSecondary)
            Button("Aggiungi Esercizio") {
                viewModel.isShowingAddExercise = true
            }
            .buttonStyle(PrimaryButtonStyle())
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding(Spacing.xl)
    }

    private func formatWeight(_ kg: Double) -> String {
        kg == kg.rounded() ? "\(Int(kg))" : String(format: "%.1f", kg)
    }
}

// MARK: - Set Row

struct SetCompletedRow: View {
    let set: CompletedSet
    var body: some View {
        HStack {
            Text("Serie \(set.setNumber)")
                .font(.bodySmall)
                .foregroundStyle(.appTextTertiary)
                .frame(width: 60, alignment: .leading)
            Text("\(formatWeight(set.weightKg)) kg")
                .font(.bodyMedium)
                .foregroundStyle(.appTextPrimary)
            Text("×").foregroundStyle(.appTextTertiary)
            Text("\(set.reps) reps")
                .font(.bodyMedium)
                .foregroundStyle(.appTextPrimary)
            Spacer()
            Image(systemName: "checkmark.circle.fill").foregroundStyle(.appSuccess)
        }
        .padding(.vertical, Spacing.xs)
    }

    private func formatWeight(_ kg: Double) -> String {
        kg == kg.rounded() ? "\(Int(kg))" : String(format: "%.1f", kg)
    }
}

// MARK: - Timer Banner

struct RestTimerBanner: View {
    let timer: TimerService
    let onSkip: () -> Void

    var body: some View {
        HStack(spacing: Spacing.lg) {
            VStack(alignment: .leading, spacing: 2) {
                Text("RECUPERO")
                    .font(.caption)
                    .foregroundStyle(.appTextSecondary)
                Text(timer.formattedTime)
                    .font(.monoLarge)
                    .foregroundStyle(timer.remainingSeconds <= 10 ? .appWarning : .appTextPrimary)
            }
            Spacer()
            Button("Skip", action: onSkip)
                .font(.bodyMedium)
                .foregroundStyle(.appTextSecondary)
        }
        .padding(.horizontal, Spacing.lg)
        .padding(.vertical, Spacing.md)
        .background(.appSurface1)
        .overlay(alignment: .top) {
            GeometryReader { geo in
                Rectangle()
                    .frame(width: geo.size.width * timer.progress, height: 2)
                    .foregroundStyle(.appAccent)
                    .animation(.linear(duration: 1), value: timer.progress)
            }
            .frame(height: 2)
        }
    }
}

// MARK: - Workout Duration

struct WorkoutDurationView: View {
    let startedAt: Date
    @State private var elapsed: TimeInterval = 0
    let tick = Timer.publish(every: 1, on: .main, in: .common).autoconnect()

    var body: some View {
        Text(elapsed.durationString)
            .font(.mono)
            .foregroundStyle(.appTextSecondary)
            .onReceive(tick) { _ in elapsed = Date().timeIntervalSince(startedAt) }
            .onAppear { elapsed = Date().timeIntervalSince(startedAt) }
    }
}
