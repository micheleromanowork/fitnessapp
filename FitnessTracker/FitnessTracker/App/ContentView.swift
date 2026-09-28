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

            ProgressPlaceholderView()
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

// Placeholder — implementato in Milestone 4
private struct ProgressPlaceholderView: View {
    var body: some View {
        NavigationStack {
            VStack(spacing: Spacing.lg) {
                Image(systemName: "chart.line.uptrend.xyaxis")
                    .font(.system(size: 64))
                    .foregroundStyle(.appInactive)
                Text("Progressi")
                    .font(.titleMedium)
                    .foregroundStyle(.appTextSecondary)
                Text("Disponibile nella prossima versione")
                    .font(.bodySmall)
                    .foregroundStyle(.appTextTertiary)
            }
            .navigationTitle("Progressi")
        }
    }
}
