import SwiftUI

struct ContentView: View {
    var body: some View {
        TabView {
            Text("Allenamento")
                .tabItem {
                    Label("Allenamento", systemImage: "dumbbell.fill")
                }

            Text("Storico")
                .tabItem {
                    Label("Storico", systemImage: "clock.fill")
                }

            Text("Progressi")
                .tabItem {
                    Label("Progressi", systemImage: "chart.line.uptrend.xyaxis")
                }

            Text("Impostazioni")
                .tabItem {
                    Label("Impostazioni", systemImage: "gear")
                }
        }
    }
}

#Preview {
    ContentView()
}
