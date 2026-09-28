import SwiftData
import SwiftUI
import Combine

@Observable
class WorkoutViewModel {
    var workout: Workout?
    var currentExerciseIndex: Int = 0
    var currentSetIndex: Int = 0
    var weightInput: String = ""
    var repsInput: String = ""
    var isShowingTimer: Bool = false
    var isShowingAddExercise: Bool = false
    var isShowingFinishAlert: Bool = false
    var errorMessage: String?
    var lastPerformance: (weightKg: Double, reps: Int)?
    var personalRecord: (weightKg: Double, reps: Int)?
    // Impostato dalla View quando conosce il nome italiano dell'esercizio corrente
    var currentExerciseName: String?

    let timer = TimerService()
    private var modelContext: ModelContext?

    var exercises: [WorkoutExercise] {
        workout?.exercises.sorted { $0.sortOrder < $1.sortOrder } ?? []
    }

    var currentExercise: WorkoutExercise? {
        guard currentExerciseIndex < exercises.count else { return nil }
        return exercises[currentExerciseIndex]
    }

    var currentExerciseSets: [CompletedSet] {
        currentExercise?.sets.sorted { $0.setNumber < $1.setNumber } ?? []
    }

    var completedSetsCount: Int {
        currentExercise?.sets.filter { $0.isCompleted }.count ?? 0
    }

    var currentSetNumber: Int {
        currentExerciseSets.first(where: { !$0.isCompleted })?.setNumber ?? (completedSetsCount + 1)
    }

    var totalSetsForExercise: Int {
        currentExercise?.sets.count ?? 0
    }

    var isLastExercise: Bool {
        currentExerciseIndex >= exercises.count - 1
    }

    var allSetsCompleted: Bool {
        guard let ex = currentExercise else { return false }
        return ex.sets.allSatisfy { $0.isCompleted }
    }

    func setup(context: ModelContext) {
        self.modelContext = context
        // Quando il timer scade naturalmente, chiudi la Live Activity
        timer.onExpire = { [weak self] in
            self?.isShowingTimer = false
            LiveActivityService.shared.end()
        }
    }

    // MARK: - Avvia workout

    func startFreeWorkout() {
        guard let ctx = modelContext else { return }
        do {
            let w = try WorkoutService.startWorkout(name: "Allenamento libero", context: ctx)
            self.workout = w
            currentExerciseIndex = 0
            loadLastPerformance()
        } catch {
            showError("Impossibile avviare l'allenamento")
        }
    }

    func startWorkout(from routine: Routine) {
        guard let ctx = modelContext else { return }
        do {
            let w = try WorkoutService.startWorkout(name: routine.name, from: routine, context: ctx)
            self.workout = w
            currentExerciseIndex = 0
            loadLastPerformance()
        } catch {
            showError("Impossibile avviare l'allenamento")
        }
    }

    // MARK: - Input handling

    func prefillFromLastPerformance() {
        if let last = lastPerformance {
            if weightInput.isEmpty { weightInput = formatWeight(last.weightKg) }
            if repsInput.isEmpty { repsInput = "\(last.reps)" }
        }
    }

    private func formatWeight(_ kg: Double) -> String {
        kg == kg.rounded() ? "\(Int(kg))" : String(format: "%.1f", kg)
    }

    // MARK: - Completa serie

    func completeCurrentSet() {
        guard let ctx = modelContext,
              let set = pendingSet else {
            showError("Nessuna serie da completare")
            return
        }
        guard let weight = Double(weightInput.replacingOccurrences(of: ",", with: ".")),
              let reps = Int(repsInput),
              weight >= 0, reps > 0 else {
            showError("Inserisci peso e ripetizioni validi")
            return
        }

        do {
            try WorkoutService.completeSet(set, weightKg: weight, reps: reps, context: ctx)
            errorMessage = nil
            HapticService.impact(.medium)

            let restSecs = currentExercise?.restSeconds ?? settingsRestSeconds
            startTimer(seconds: restSecs)
            loadLastPerformance()
        } catch {
            showError("Errore nel salvataggio")
        }
    }

    private var pendingSet: CompletedSet? {
        currentExerciseSets.first { !$0.isCompleted }
    }

    private var settingsRestSeconds: Int { 90 }

    // MARK: - Elimina serie

    func deleteSet(_ set: CompletedSet) {
        guard let ctx = modelContext else { return }
        try? WorkoutService.removeSet(set, context: ctx)
    }

    // MARK: - Aggiungi serie

    func addSet() {
        guard let ctx = modelContext, let we = currentExercise else { return }
        do {
            _ = try WorkoutService.addSet(to: we, context: ctx)
        } catch {
            showError("Errore aggiunta serie")
        }
    }

    // MARK: - Navigazione esercizi

    func goToNextExercise() {
        guard currentExerciseIndex < exercises.count - 1 else { return }
        currentExerciseIndex += 1
        weightInput = ""
        repsInput = ""
        loadLastPerformance()
    }

    func goToPreviousExercise() {
        guard currentExerciseIndex > 0 else { return }
        currentExerciseIndex -= 1
        weightInput = ""
        repsInput = ""
        loadLastPerformance()
    }

    // MARK: - Timer

    func startTimer(seconds: Int) {
        timer.start(seconds: seconds)
        isShowingTimer = true

        // Avvia Live Activity sul Dynamic Island (iPhone 14 Pro+ / iOS 16.1+)
        let exerciseName = currentExerciseName ?? currentExercise?.exerciseId ?? "Esercizio"
        let workoutName = workout?.name ?? "Allenamento"
        LiveActivityService.shared.start(
            exerciseName: exerciseName,
            workoutName: workoutName,
            totalSeconds: seconds
        )
    }

    func skipTimer() {
        timer.skip()
        isShowingTimer = false
        LiveActivityService.shared.end()
    }

    // MARK: - Completa / cancella workout

    func finishWorkout() {
        guard let ctx = modelContext, let w = workout else { return }
        do {
            try WorkoutService.completeWorkout(w, context: ctx)
            HapticService.notification(.success)
            workout = nil
            if let all = try? ctx.fetch(FetchDescriptor<Workout>()) {
                WidgetDataService.update(workouts: all)
            }
        } catch {
            showError("Errore nel completamento")
        }
    }

    func cancelWorkout() {
        guard let ctx = modelContext, let w = workout else { return }
        do {
            try WorkoutService.cancelWorkout(w, context: ctx)
            workout = nil
        } catch {
            showError("Errore nell'annullamento")
        }
    }

    // MARK: - Carica ultima prestazione + record personale

    private func loadLastPerformance() {
        guard let ctx = modelContext,
              let exerciseId = currentExercise?.exerciseId else { return }
        lastPerformance = try? ExerciseService.lastPerformance(exerciseId: exerciseId, context: ctx)
        if let pr = try? WorkoutService.personalRecord(exerciseId: exerciseId, context: ctx) {
            personalRecord = (pr.weightKg, pr.reps)
        } else {
            personalRecord = nil
        }
        prefillFromLastPerformance()
    }

    // MARK: - Error handling

    private func showError(_ message: String) {
        errorMessage = message
        HapticService.notification(.error)
        Task { @MainActor in
            try? await Task.sleep(for: .seconds(3))
            if errorMessage == message { errorMessage = nil }
        }
    }
}
