import ActivityKit
import SwiftUI
import WidgetKit

struct RestTimerLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: RestTimerAttributes.self) { context in
            // Lock screen / notifica banner
            RestTimerLockScreenView(context: context)
        } dynamicIsland: { context in
            DynamicIsland {
                // ── Expanded ────────────────────────────────────────────────────
                DynamicIslandExpandedRegion(.leading) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("RECUPERO")
                            .font(.caption2)
                            .fontWeight(.semibold)
                            .foregroundStyle(.secondary)
                        Text(context.state.exerciseName)
                            .font(.headline)
                            .foregroundStyle(.primary)
                            .lineLimit(1)
                        Text(context.attributes.workoutName)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                            .lineLimit(1)
                    }
                    .padding(.leading, 6)
                    .padding(.top, 4)
                }

                DynamicIslandExpandedRegion(.trailing) {
                    Text(timerInterval: Date()...context.state.endDate, countsDown: true)
                        .font(.system(.title, design: .monospaced, weight: .bold))
                        .foregroundStyle(.blue)
                        .monospacedDigit()
                        .multilineTextAlignment(.trailing)
                        .padding(.trailing, 6)
                        .padding(.top, 4)
                }

                DynamicIslandExpandedRegion(.bottom) {
                    ProgressView(
                        timerInterval: Date()...context.state.endDate,
                        countsDown: true,
                        label: { EmptyView() },
                        currentValueLabel: { EmptyView() }
                    )
                    .tint(.blue)
                    .padding(.horizontal, 8)
                    .padding(.bottom, 6)
                }

            } compactLeading: {
                // ── Compact leading: icona timer ─────────────────────────────
                Image(systemName: "timer")
                    .foregroundStyle(.blue)
                    .padding(.leading, 4)

            } compactTrailing: {
                // ── Compact trailing: countdown ────────────────────────────
                Text(timerInterval: Date()...context.state.endDate, countsDown: true)
                    .font(.system(.caption, design: .monospaced, weight: .semibold))
                    .foregroundStyle(.blue)
                    .monospacedDigit()
                    .frame(width: 44)
                    .padding(.trailing, 4)

            } minimal: {
                // ── Minimal (angolo): solo il tempo ───────────────────────
                Text(timerInterval: Date()...context.state.endDate, countsDown: true)
                    .font(.system(.caption2, design: .monospaced))
                    .foregroundStyle(.blue)
                    .monospacedDigit()
            }
            .keylineTint(.blue)
            .contentMargins(.horizontal, 12, for: .expanded)
            .contentMargins(.vertical, 8, for: .expanded)
        }
    }
}

// MARK: - Lock Screen View

struct RestTimerLockScreenView: View {
    let context: ActivityViewContext<RestTimerAttributes>

    var body: some View {
        HStack(spacing: 16) {
            VStack(alignment: .leading, spacing: 4) {
                Label("RECUPERO", systemImage: "timer")
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundStyle(.blue)

                Text(context.state.exerciseName)
                    .font(.headline)
                    .foregroundStyle(.primary)
                    .lineLimit(2)

                Text(context.attributes.workoutName)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .lineLimit(1)
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 8) {
                Text(timerInterval: Date()...context.state.endDate, countsDown: true)
                    .font(.system(.largeTitle, design: .monospaced, weight: .bold))
                    .foregroundStyle(.blue)
                    .monospacedDigit()

                ProgressView(
                    timerInterval: Date()...context.state.endDate,
                    countsDown: true,
                    label: { EmptyView() },
                    currentValueLabel: { EmptyView() }
                )
                .tint(.blue)
                .frame(width: 120)
            }
        }
        .padding(16)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 16))
    }
}
