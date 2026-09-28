import SwiftUI

// MARK: - Colors
extension Color {
    static let appBackground  = Color("AppBackground")
    static let appSurface1    = Color("AppSurface1")
    static let appSurface2    = Color("AppSurface2")
    static let appAccent      = Color("AppAccent")
    static let appTextPrimary   = Color("AppTextPrimary")
    static let appTextSecondary = Color("AppTextSecondary")
    static let appTextTertiary  = Color("AppTextTertiary")
    static let appSuccess     = Color("AppSuccess")
    static let appWarning     = Color("AppWarning")
    static let appDestructive = Color("AppDestructive")
    static let appInactive    = Color("AppInactive")
}

// MARK: - Spacing
enum Spacing {
    static let xs:  CGFloat = 4
    static let sm:  CGFloat = 8
    static let md:  CGFloat = 16
    static let lg:  CGFloat = 24
    static let xl:  CGFloat = 32
    static let xxl: CGFloat = 48
}

// MARK: - Corner Radius
enum CornerRadius {
    static let sm: CGFloat = 8
    static let md: CGFloat = 12
    static let lg: CGFloat = 16
    static let xl: CGFloat = 20
}

// MARK: - Typography
extension Font {
    static let displayLarge  = Font.system(size: 56, weight: .bold)
    static let displayMedium = Font.system(size: 40, weight: .bold)
    static let titleLarge    = Font.system(size: 28, weight: .semibold)
    static let titleMedium   = Font.system(size: 22, weight: .semibold)
    static let titleSmall    = Font.system(size: 17, weight: .semibold)
    static let bodyLarge     = Font.system(size: 17, weight: .regular)
    static let bodyMedium    = Font.system(size: 15, weight: .regular)
    static let bodySmall     = Font.system(size: 13, weight: .regular)
    static let caption       = Font.system(size: 11, weight: .regular)
    static let mono          = Font.system(size: 17, weight: .regular, design: .monospaced)
    static let monoLarge     = Font.system(size: 56, weight: .bold, design: .monospaced)
}

// MARK: - Animation
extension Animation {
    static let appQuick    = Animation.easeOut(duration: 0.15)
    static let appStandard = Animation.easeOut(duration: 0.25)
    static let appSpring   = Animation.spring(response: 0.35, dampingFraction: 0.75)
}
