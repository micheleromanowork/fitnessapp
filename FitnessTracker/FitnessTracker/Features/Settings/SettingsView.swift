import SwiftUI
import SwiftData

struct SettingsView: View {
    @Query private var settingsArr: [AppSettings]
    @Query private var workouts: [Workout]
    @Environment(\.modelContext) private var modelContext

    private var settings: AppSettings {
        if let s = settingsArr.first { return s }
        let s = AppSettings()
        modelContext.insert(s)
        return s
    }

    @State private var exportURL: URL?
    @State private var showShare = false
    @State private var showResetOnboarding = false

    var body: some View {
        NavigationStack {
            Form {
                Section("Allenamento") {
                    HStack {
                        Text("Recupero predefinito")
                        Spacer()
                        Stepper("\(settings.defaultRestSeconds)s",
                                value: Binding(
                                    get: { settings.defaultRestSeconds },
                                    set: { settings.defaultRestSeconds = $0 }
                                ),
                                in: 15...300, step: 15)
                    }

                    Toggle("Avvia timer automaticamente", isOn: Binding(
                        get: { settings.autoStartTimer },
                        set: { settings.autoStartTimer = $0 }
                    ))

                    Toggle("Feedback aptico", isOn: Binding(
                        get: { settings.hapticEnabled },
                        set: { settings.hapticEnabled = $0 }
                    ))
                }

                Section("Unità di misura") {
                    Picker("Peso", selection: Binding(
                        get: { settings.weightUnit },
                        set: { settings.weightUnit = $0 }
                    )) {
                        Text("Chilogrammi (kg)").tag("kg")
                        Text("Libbre (lb)").tag("lb")
                    }
                }

                Section("Dati") {
                    Button {
                        let csv = ExportService.exportWorkoutsCSV(workouts: workouts)
                        exportURL = ExportService.writeToTemp(csv)
                        showShare = exportURL != nil
                    } label: {
                        Label("Esporta allenamenti (CSV)", systemImage: "square.and.arrow.up")
                    }

                    Button(role: .destructive) {
                        showResetOnboarding = true
                    } label: {
                        Label("Rivedi onboarding", systemImage: "arrow.counterclockwise")
                    }
                }

                Section("App") {
                    HStack {
                        Text("Versione")
                        Spacer()
                        Text(Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "—")
                            .foregroundStyle(.appTextSecondary)
                    }
                }
            }
            .navigationTitle("Impostazioni")
            .sheet(isPresented: $showShare) {
                if let url = exportURL {
                    ShareSheet(items: [url])
                }
            }
            .confirmationDialog("Rivedi onboarding?", isPresented: $showResetOnboarding, titleVisibility: .visible) {
                Button("Ripristina", role: .destructive) {
                    settings.onboardingCompleted = false
                    try? modelContext.save()
                }
                Button("Annulla", role: .cancel) {}
            } message: {
                Text("Verrai reindirizzato alla schermata iniziale.")
            }
        }
    }
}

private struct ShareSheet: UIViewControllerRepresentable {
    let items: [Any]

    func makeUIViewController(context: Context) -> UIActivityViewController {
        UIActivityViewController(activityItems: items, applicationActivities: nil)
    }

    func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) {}
}
