import SwiftUI
import SwiftData

struct ContentView: View {
    @Query private var settingsArr: [AppSettings]
    @Environment(\.modelContext) private var modelContext

    private var settings: AppSettings {
        if let s = settingsArr.first { return s }
        let s = AppSettings()
        modelContext.insert(s)
        return s
    }

    var body: some View {
        Group {
            if !settings.onboardingCompleted {
                OnboardingView()
            } else {
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
    }
}
