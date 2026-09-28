import SwiftUI

struct ContentView: View {
    var body: some View {
        TabView {
            WorkoutView()
                .tabItem {
                    Label("Allenamento", systemImage: "dumbbell.fill")
                }

            HistoryView()
                .tabItem {
                    Label("Storico", systemImage: "clock.fill")
                }

            ProgressView()
                .tabItem {
                    Label("Progressi", systemImage: "chart.line.uptrend.xyaxis")
                }

            SettingsView()
                .tabItem {
                    Label("Impostazioni", systemImage: "gear")
                }
        }
        .tint(.appAccent)
    }
}
