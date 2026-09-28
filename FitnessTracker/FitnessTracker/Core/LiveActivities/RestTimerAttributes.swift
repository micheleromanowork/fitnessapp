import ActivityKit
import Foundation

// Struttura condivisa tra main app target e widget extension target.
// In Xcode: aggiungere questo file a ENTRAMBI i target.
struct RestTimerAttributes: ActivityAttributes {
    // Stato dinamico — aggiornato durante la Live Activity
    public struct ContentState: Codable, Hashable {
        // Uso Date invece di secondi: il widget fa il conto da solo senza update ogni secondo
        var endDate: Date
        var totalSeconds: Int
        var isRunning: Bool
        var exerciseName: String
    }

    // Attributi statici — non cambiano durante l'attività
    var workoutName: String
}
