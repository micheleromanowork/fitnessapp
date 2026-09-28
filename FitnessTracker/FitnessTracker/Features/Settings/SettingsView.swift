import SwiftUI
import SwiftData

struct SettingsView: View {
    @Query private var settingsArr: [AppSettings]
    @Environment(\.modelContext) private var modelContext

    private var settings: AppSettings {
        if let s = settingsArr.first { return s }
        let s = AppSettings()
        modelContext.insert(s)
        return s
    }

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
        }
    }
}
