import ActivityKit
import Foundation

@MainActor
final class LiveActivityService {
    static let shared = LiveActivityService()
    private init() {}

    private var activity: Activity<RestTimerAttributes>?

    // MARK: - Start

    func start(exerciseName: String, workoutName: String, totalSeconds: Int) {
        guard ActivityAuthorizationInfo().areActivitiesEnabled else { return }
        endImmediate()

        let endDate = Date().addingTimeInterval(Double(totalSeconds))
        let attributes = RestTimerAttributes(workoutName: workoutName)
        let state = RestTimerAttributes.ContentState(
            endDate: endDate,
            totalSeconds: totalSeconds,
            isRunning: true,
            exerciseName: exerciseName
        )
        let content = ActivityContent(
            state: state,
            staleDate: endDate.addingTimeInterval(5)
        )

        do {
            activity = try Activity.request(attributes: attributes, content: content, pushType: nil)
        } catch {
            // ActivityKit non disponibile o permesso negato — in-app banner come fallback
        }
    }

    // MARK: - End

    func end() {
        guard let act = activity else { return }
        activity = nil

        let finalState = RestTimerAttributes.ContentState(
            endDate: Date(),
            totalSeconds: act.content.state.totalSeconds,
            isRunning: false,
            exerciseName: act.content.state.exerciseName
        )
        Task {
            await act.end(
                ActivityContent(state: finalState, staleDate: nil),
                dismissalPolicy: .after(Date().addingTimeInterval(3))
            )
        }
    }

    var isActive: Bool { activity != nil }

    // MARK: - Private

    private func endImmediate() {
        guard let act = activity else { return }
        activity = nil
        Task { await act.end(dismissalPolicy: .immediate) }
    }
}
