import SwiftUI
import SwiftData

struct OnboardingView: View {
    @Environment(\.modelContext) private var modelContext
    @Query private var settingsArr: [AppSettings]

    private var settings: AppSettings {
        if let s = settingsArr.first { return s }
        let s = AppSettings()
        modelContext.insert(s)
        return s
    }

    @State private var page = 0
    @State private var selectedGoal = ""

    private let goals = [
        ("Perdere peso", "flame.fill"),
        ("Aumentare massa", "figure.strengthtraining.traditional"),
        ("Migliorare forma", "figure.run"),
        ("Salute generale", "heart.fill"),
    ]

    var body: some View {
        ZStack {
            Color.appBackground.ignoresSafeArea()
            switch page {
            case 0: welcomePage
            case 1: goalPage
            default: readyPage
            }
        }
        .animation(.easeInOut, value: page)
    }

    private var welcomePage: some View {
        VStack(spacing: Spacing.lg) {
            Spacer()
            Image(systemName: "dumbbell.fill")
                .font(.system(size: 72))
                .foregroundStyle(.appAccent)
            Text("Benvenuto in\nFitness Tracker")
                .font(.title.bold())
                .multilineTextAlignment(.center)
                .foregroundStyle(.appTextPrimary)
            Text("Tieni traccia dei tuoi allenamenti,\nmonitorizza i progressi e raggiungi i tuoi obiettivi.")
                .font(.body)
                .multilineTextAlignment(.center)
                .foregroundStyle(.appTextSecondary)
                .padding(.horizontal, Spacing.xl)
            Spacer()
            Button("Inizia") { page = 1 }
                .buttonStyle(PrimaryButtonStyle())
                .padding(.horizontal, Spacing.lg)
                .padding(.bottom, Spacing.xl)
        }
    }

    private var goalPage: some View {
        VStack(spacing: Spacing.lg) {
            Spacer()
            Text("Qual è il tuo obiettivo?")
                .font(.title2.bold())
                .foregroundStyle(.appTextPrimary)
            Text("Personalizzare l'esperienza in base\nal tuo obiettivo principale.")
                .font(.body)
                .multilineTextAlignment(.center)
                .foregroundStyle(.appTextSecondary)
                .padding(.horizontal, Spacing.xl)

            VStack(spacing: Spacing.sm) {
                ForEach(goals, id: \.0) { goal, icon in
                    GoalRow(label: goal, icon: icon, isSelected: selectedGoal == goal) {
                        selectedGoal = goal
                    }
                }
            }
            .padding(.horizontal, Spacing.lg)

            Spacer()
            Button("Continua") {
                settings.fitnessGoal = selectedGoal
                page = 2
            }
            .buttonStyle(PrimaryButtonStyle())
            .disabled(selectedGoal.isEmpty)
            .padding(.horizontal, Spacing.lg)
            .padding(.bottom, Spacing.xl)
        }
    }

    private var readyPage: some View {
        VStack(spacing: Spacing.lg) {
            Spacer()
            Image(systemName: "checkmark.seal.fill")
                .font(.system(size: 72))
                .foregroundStyle(.appAccent)
            Text("Sei pronto!")
                .font(.title.bold())
                .foregroundStyle(.appTextPrimary)
            Text("Il tuo profilo è configurato.\nInizia subito il tuo primo allenamento.")
                .font(.body)
                .multilineTextAlignment(.center)
                .foregroundStyle(.appTextSecondary)
                .padding(.horizontal, Spacing.xl)
            Spacer()
            Button("Vai all'app") {
                settings.onboardingCompleted = true
                try? modelContext.save()
            }
            .buttonStyle(PrimaryButtonStyle())
            .padding(.horizontal, Spacing.lg)
            .padding(.bottom, Spacing.xl)
        }
    }
}

private struct GoalRow: View {
    let label: String
    let icon: String
    let isSelected: Bool
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: Spacing.md) {
                Image(systemName: icon)
                    .font(.title3)
                    .foregroundStyle(isSelected ? .white : .appAccent)
                    .frame(width: 32)
                Text(label)
                    .font(.bodyMedium)
                    .foregroundStyle(isSelected ? .white : .appTextPrimary)
                Spacer()
                if isSelected {
                    Image(systemName: "checkmark")
                        .foregroundStyle(.white)
                }
            }
            .padding(Spacing.md)
            .background(
                isSelected ? Color.appAccent : Color.appSurface1,
                in: RoundedRectangle(cornerRadius: 12)
            )
        }
        .animation(.easeInOut(duration: 0.15), value: isSelected)
    }
}

private struct PrimaryButtonStyle: ButtonStyle {
    @Environment(\.isEnabled) private var isEnabled

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.bodyMedium)
            .frame(maxWidth: .infinity)
            .padding()
            .background(
                isEnabled ? Color.appAccent : Color.appSurface2,
                in: RoundedRectangle(cornerRadius: 14)
            )
            .foregroundStyle(isEnabled ? .white : Color.appTextTertiary)
            .scaleEffect(configuration.isPressed ? 0.97 : 1)
            .animation(.easeInOut(duration: 0.1), value: configuration.isPressed)
    }
}
