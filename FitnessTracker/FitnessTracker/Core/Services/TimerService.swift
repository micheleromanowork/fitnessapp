import Foundation
import Combine

@Observable
class TimerService {
    var remainingSeconds: Int = 0
    var totalSeconds: Int = 0
    var isRunning: Bool = false
    var isExpired: Bool = false

    // Chiamato su main thread quando il timer scade naturalmente
    var onExpire: (() -> Void)?

    private var timer: AnyCancellable?

    var progress: Double {
        guard totalSeconds > 0 else { return 0 }
        return Double(remainingSeconds) / Double(totalSeconds)
    }

    var formattedTime: String {
        let m = remainingSeconds / 60
        let s = remainingSeconds % 60
        return String(format: "%d:%02d", m, s)
    }

    func start(seconds: Int) {
        cancel()
        totalSeconds = seconds
        remainingSeconds = seconds
        isRunning = true
        isExpired = false
        scheduleTimer()
    }

    func pause() {
        timer?.cancel()
        timer = nil
        isRunning = false
    }

    func resume() {
        guard !isExpired, remainingSeconds > 0 else { return }
        isRunning = true
        scheduleTimer()
    }

    func skip() {
        cancel()
        remainingSeconds = 0
        isExpired = true
        isRunning = false
    }

    func cancel() {
        timer?.cancel()
        timer = nil
        isRunning = false
        isExpired = false
        remainingSeconds = 0
        totalSeconds = 0
    }

    private func scheduleTimer() {
        timer = Timer.publish(every: 1, on: .main, in: .common)
            .autoconnect()
            .sink { [weak self] _ in
                guard let self, self.isRunning else { return }
                if self.remainingSeconds > 0 {
                    self.remainingSeconds -= 1
                } else {
                    self.expire()
                }
            }
    }

    private func expire() {
        timer?.cancel()
        timer = nil
        isRunning = false
        isExpired = true
        HapticService.notification(.success)
        onExpire?()
    }
}

// MARK: - Haptic

enum HapticService {
    static func impact(_ style: UIImpactFeedbackGenerator.FeedbackStyle = .medium) {
        let gen = UIImpactFeedbackGenerator(style: style)
        gen.impactOccurred()
    }

    static func notification(_ type: UINotificationFeedbackGenerator.FeedbackType) {
        let gen = UINotificationFeedbackGenerator()
        gen.notificationOccurred(type)
    }
}
