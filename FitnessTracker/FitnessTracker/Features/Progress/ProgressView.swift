import SwiftUI
import Charts
import SwiftData

struct ProgressView: View {
    @Environment(\.modelContext) private var modelContext
    @State private var viewModel = ProgressViewModel()

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: Spacing.lg) {
                    statTilesSection
                    weeklyVolumeSection
                    exerciseHistorySection
                }
                .padding(Spacing.md)
            }
            .navigationTitle("Progressi")
            .onAppear { viewModel.loadAll(context: modelContext) }
            .sheet(isPresented: $viewModel.isShowingExercisePicker) {
                ExercisePickerView { exerciseId in
                    viewModel.isShowingExercisePicker = false
                    viewModel.selectExercise(id: exerciseId, name: nil, context: modelContext)
                }
            }
        }
    }

    // MARK: - Stat Tiles

    private var statTilesSection: some View {
        let s = viewModel.aggregateStats
        return LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: Spacing.sm) {
            StatTile(label: "Allenamenti", value: "\(s.totalWorkouts)", icon: "dumbbell.fill", color: .appAccent)
            StatTile(label: "Ore totali", value: formatHours(s.totalHours), icon: "clock.fill", color: .appSuccess)
            StatTile(label: "Serie totali", value: "\(s.totalSets)", icon: "list.number", color: .appWarning)
            StatTile(label: "Volume totale", value: formatVolume(s.totalVolumeKg), icon: "scalemass.fill", color: .appDestructive)
        }
    }

    // MARK: - Weekly Volume Bar Chart

    private var weeklyVolumeSection: some View {
        SectionCard(title: "Volume settimanale", icon: "chart.bar.fill") {
            if viewModel.weeklyVolumes.allSatisfy({ $0.volumeKg == 0 }) {
                emptyChartPlaceholder(text: "Completa qualche allenamento per vedere il volume")
            } else {
                Chart(viewModel.weeklyVolumes) { item in
                    BarMark(
                        x: .value("Settimana", item.label),
                        y: .value("Volume (kg)", item.volumeKg)
                    )
                    .foregroundStyle(item.volumeKg > 0 ? Color.appAccent : Color.appSurface1)
                    .cornerRadius(4)
                }
                .frame(height: 160)
                .chartYAxis {
                    AxisMarks(position: .leading) { value in
                        AxisGridLine()
                        AxisValueLabel {
                            if let v = value.as(Double.self) {
                                Text(formatVolume(v)).font(.system(size: 10))
                            }
                        }
                    }
                }
                .chartXAxis {
                    AxisMarks { value in
                        AxisValueLabel {
                            if let s = value.as(String.self) {
                                Text(s).font(.system(size: 10))
                            }
                        }
                    }
                }
            }
        }
    }

    // MARK: - Exercise History (line chart)

    private var exerciseHistorySection: some View {
        SectionCard(title: "Storico esercizio", icon: "chart.line.uptrend.xyaxis") {
            VStack(alignment: .leading, spacing: Spacing.sm) {
                Button(action: { viewModel.isShowingExercisePicker = true }) {
                    HStack {
                        Text(viewModel.selectedExerciseName ?? "Seleziona un esercizio")
                            .font(.bodyMedium)
                            .foregroundStyle(viewModel.selectedExerciseName == nil ? .appTextTertiary : .appTextPrimary)
                        Spacer()
                        Image(systemName: "chevron.right")
                            .font(.caption)
                            .foregroundStyle(.appTextTertiary)
                    }
                    .padding(Spacing.sm)
                    .background(.appSurface1, in: RoundedRectangle(cornerRadius: CornerRadius.sm))
                }

                if let id = viewModel.selectedExerciseId {
                    if viewModel.exerciseHistory.isEmpty {
                        emptyChartPlaceholder(text: "Nessun dato per questo esercizio")
                    } else {
                        exerciseLineChart
                        if let cmp = viewModel.comparison {
                            comparisonRow(cmp)
                        }
                    }
                    let _ = id
                }
            }
        }
    }

    private var exerciseLineChart: some View {
        Chart(viewModel.exerciseHistory) { point in
            LineMark(
                x: .value("Data", point.date),
                y: .value("Peso (kg)", point.maxWeightKg)
            )
            .foregroundStyle(Color.appAccent)
            .interpolationMethod(.catmullRom)

            AreaMark(
                x: .value("Data", point.date),
                y: .value("Peso (kg)", point.maxWeightKg)
            )
            .foregroundStyle(
                LinearGradient(
                    colors: [Color.appAccent.opacity(0.25), Color.appAccent.opacity(0)],
                    startPoint: .top, endPoint: .bottom
                )
            )
            .interpolationMethod(.catmullRom)

            PointMark(
                x: .value("Data", point.date),
                y: .value("Peso (kg)", point.maxWeightKg)
            )
            .foregroundStyle(Color.appAccent)
            .symbolSize(40)
        }
        .frame(height: 160)
        .chartYAxis {
            AxisMarks(position: .leading) { value in
                AxisGridLine()
                AxisValueLabel {
                    if let v = value.as(Double.self) {
                        Text("\(Int(v))kg").font(.system(size: 10))
                    }
                }
            }
        }
        .chartXAxis {
            AxisMarks(values: .stride(by: .month)) { value in
                AxisValueLabel(format: .dateTime.month(.abbreviated).locale(Locale(identifier: "it_IT")))
                    .font(.system(size: 10))
            }
        }
    }

    private func comparisonRow(_ cmp: StatsService.SessionComparison) -> some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text("vs sessione precedente")
                    .font(.caption)
                    .foregroundStyle(.appTextTertiary)
                Text("Volume: \(formatVolume(cmp.current))")
                    .font(.bodySmall)
                    .foregroundStyle(.appTextPrimary)
            }
            Spacer()
            let isPositive = cmp.delta >= 0
            Label(
                String(format: "%@%.0f%%", isPositive ? "+" : "", cmp.deltaPercent),
                systemImage: isPositive ? "arrow.up.right" : "arrow.down.right"
            )
            .font(.bodySmall.weight(.semibold))
            .foregroundStyle(isPositive ? .appSuccess : .appDestructive)
        }
        .padding(Spacing.sm)
        .background(.appSurface1, in: RoundedRectangle(cornerRadius: CornerRadius.sm))
    }

    // MARK: - Helpers

    private func emptyChartPlaceholder(text: String) -> some View {
        VStack(spacing: Spacing.sm) {
            Image(systemName: "chart.line.uptrend.xyaxis")
                .font(.system(size: 32))
                .foregroundStyle(.appInactive)
            Text(text)
                .font(.bodySmall)
                .foregroundStyle(.appTextTertiary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(Spacing.lg)
    }

    private func formatHours(_ h: Double) -> String {
        if h < 1 { return String(format: "%.0fm", h * 60) }
        return String(format: "%.1fh", h)
    }

    private func formatVolume(_ kg: Double) -> String {
        if kg >= 1000 { return String(format: "%.1ft", kg / 1000) }
        return "\(Int(kg))kg"
    }
}

// MARK: - Subviews

private struct StatTile: View {
    let label: String
    let value: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.xs) {
            HStack {
                Image(systemName: icon)
                    .font(.bodySmall)
                    .foregroundStyle(color)
                Spacer()
            }
            Text(value)
                .font(.titleSmall)
                .foregroundStyle(.appTextPrimary)
                .lineLimit(1)
                .minimumScaleFactor(0.7)
            Text(label)
                .font(.caption)
                .foregroundStyle(.appTextSecondary)
        }
        .padding(Spacing.sm + 2)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.appSurface1, in: RoundedRectangle(cornerRadius: CornerRadius.md))
    }
}

private struct SectionCard<Content: View>: View {
    let title: String
    let icon: String
    @ViewBuilder let content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.sm) {
            HStack(spacing: Spacing.xs) {
                Image(systemName: icon)
                    .font(.bodySmall)
                    .foregroundStyle(.appAccent)
                Text(title)
                    .font(.titleSmall)
                    .foregroundStyle(.appTextPrimary)
            }
            content
        }
        .padding(Spacing.md)
        .background(.appSurface1, in: RoundedRectangle(cornerRadius: CornerRadius.lg))
    }
}
