import SwiftUI

struct ExerciseDetailView: View {
    let exercise: Exercise
    let viewModel: WorkoutViewModel
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: Spacing.lg) {
                    musclesSection
                    if viewModel.personalRecord != nil || viewModel.lastPerformance != nil {
                        recordsSection
                    }
                    if !exercise.instructionsIt.isEmpty {
                        instructionsSection
                    }
                    if !exercise.tipsIt.isEmpty {
                        tipsSection
                    }
                }
                .padding(Spacing.md)
            }
            .navigationTitle(exercise.nameIt)
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Fine") { dismiss() }
                }
            }
        }
    }

    private var musclesSection: some View {
        VStack(alignment: .leading, spacing: Spacing.sm) {
            DetailSectionHeader("Muscoli")
            VStack(alignment: .leading, spacing: Spacing.sm) {
                if !exercise.primaryMuscles.isEmpty {
                    MuscleRow(label: "Primari", value: exercise.primaryMuscles.map { $0.capitalized }.joined(separator: ", "), primary: true)
                }
                if !exercise.secondaryMuscles.isEmpty {
                    MuscleRow(label: "Secondari", value: exercise.secondaryMuscles.map { $0.capitalized }.joined(separator: ", "), primary: false)
                }
                MuscleRow(label: "Recupero", value: "\(exercise.defaultRestSeconds)s", primary: false)
            }
            .padding(Spacing.md)
            .background(.appSurface1, in: RoundedRectangle(cornerRadius: CornerRadius.md))
        }
    }

    private var recordsSection: some View {
        VStack(alignment: .leading, spacing: Spacing.sm) {
            DetailSectionHeader("Le tue statistiche")
            HStack(spacing: Spacing.sm) {
                if let pr = viewModel.personalRecord {
                    ExerciseStatCard(title: "Record", value: "\(formatWeight(pr.weightKg)) kg × \(pr.reps)", icon: "trophy.fill", color: .appWarning)
                }
                if let last = viewModel.lastPerformance {
                    ExerciseStatCard(title: "Ultima volta", value: "\(formatWeight(last.weightKg)) kg × \(last.reps)", icon: "clock.arrow.circlepath", color: .appAccent)
                }
            }
        }
    }

    private var instructionsSection: some View {
        VStack(alignment: .leading, spacing: Spacing.sm) {
            DetailSectionHeader("Esecuzione")
            VStack(alignment: .leading, spacing: Spacing.md) {
                ForEach(Array(exercise.instructionsIt.enumerated()), id: \.offset) { i, step in
                    HStack(alignment: .top, spacing: Spacing.sm) {
                        Text("\(i + 1)")
                            .font(.caption)
                            .fontWeight(.bold)
                            .foregroundStyle(.white)
                            .frame(width: 22, height: 22)
                            .background(.appAccent, in: Circle())
                        Text(step)
                            .font(.bodySmall)
                            .foregroundStyle(.appTextPrimary)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                }
            }
            .padding(Spacing.md)
            .background(.appSurface1, in: RoundedRectangle(cornerRadius: CornerRadius.md))
        }
    }

    private var tipsSection: some View {
        VStack(alignment: .leading, spacing: Spacing.sm) {
            DetailSectionHeader("Consigli")
            VStack(alignment: .leading, spacing: Spacing.sm) {
                ForEach(exercise.tipsIt, id: \.self) { tip in
                    HStack(alignment: .top, spacing: Spacing.sm) {
                        Image(systemName: "lightbulb.fill")
                            .font(.caption)
                            .foregroundStyle(.appWarning)
                            .frame(width: 16)
                        Text(tip)
                            .font(.bodySmall)
                            .foregroundStyle(.appTextPrimary)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                }
            }
            .padding(Spacing.md)
            .background(.appSurface1, in: RoundedRectangle(cornerRadius: CornerRadius.md))
        }
    }

    private func formatWeight(_ kg: Double) -> String {
        kg == kg.rounded() ? "\(Int(kg))" : String(format: "%.1f", kg)
    }
}

private struct DetailSectionHeader: View {
    let title: String
    init(_ title: String) { self.title = title }
    var body: some View {
        Text(title)
            .font(.titleSmall)
            .foregroundStyle(.appTextPrimary)
    }
}

private struct MuscleRow: View {
    let label: String
    let value: String
    let primary: Bool
    var body: some View {
        HStack(alignment: .top, spacing: Spacing.sm) {
            Text(label)
                .font(.caption)
                .foregroundStyle(.appTextTertiary)
                .frame(width: 65, alignment: .leading)
            Text(value)
                .font(.bodySmall)
                .foregroundStyle(primary ? .appTextPrimary : .appTextSecondary)
        }
    }
}

private struct ExerciseStatCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color
    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.xs) {
            HStack(spacing: Spacing.xs) {
                Image(systemName: icon).font(.caption).foregroundStyle(color)
                Text(title).font(.caption).foregroundStyle(.appTextSecondary)
            }
            Text(value).font(.titleSmall).foregroundStyle(.appTextPrimary)
        }
        .padding(Spacing.md)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.appSurface1, in: RoundedRectangle(cornerRadius: CornerRadius.md))
    }
}
