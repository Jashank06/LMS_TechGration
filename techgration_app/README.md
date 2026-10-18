# TechGration Student Mobile App 🎓📱

High-impact, industry-grade mobile application built exclusively for the **TechGration Student Portal** using Flutter. Designed with a visual-first, minimal-text philosophy inspired by the Under 25 and modern tier-1 design systems.

---

## 🌟 Key Features & Reference Screen Mapping

1. **Splash Screen (`lib/features/splash/splash_screen.dart`)**:
   - Minimalist white backdrop with continuous squircle border and breathing TechGration "TG" logo crest.
2. **Onboarding Carousel (`lib/features/onboarding/onboarding_screen.dart`)**:
   - Layered 3D cards (*"Build Communities"*, *"Spaces"*, *"Connect"* with live pill badges `❤️ 399`, `💬 249`).
   - Floating electric blue action badge on the bottom right.
   - Diamond page indicator dots and dual *"Skip"* / *"Next →"* action buttons.
3. **Sign In / Sign Up (`lib/features/auth/login_screen.dart`)**:
   - Clean outlined input with `+91` country selector, vertical divider, and active orange blinking cursor.
   - Custom rounded terms checkbox and solid pitch-black `Continue →` button with haptics.
   - Dual mode support (Mobile OTP & Student Email/Password).
4. **6-Digit OTP Verification (`lib/features/auth/otp_screen.dart`)**:
   - 6 discrete rounded boxes with focus glow and autofill support.
   - Real-time countdown timer (*"Resend in 26"*).
   - Auto-verifies upon 6th digit with celebratory haptic double-pulse.
5. **Student Dashboard & Spotlight (`lib/features/dashboard/home_screen.dart`)**:
   - Top Header: Location pill (*"📍 Faridabad"* / *"TechGration Campus"*), Bell icon with unread badge, Chat bubble, 3D avatar circle.
   - Search pill bar (`#F1F3F5`).
   - **Spotlight 🌟** carousel with 3D cards (Monthly MVPs, Masterclasses, Hackathons).
   - Filter pills row (*"Events"*, *"Spaces"*, *"Missions"*, *"Live Classes"*).
   - Featured Event card (Halloween Hackathon & Live Masterclasses).
   - Bright orange Floating Action Button (FAB) with `+`.
6. **Campus Spaces & Community Feed (`lib/features/spaces/spaces_screen.dart`)**:
   - Top Bar with Hamburger menu & Chat.
   - University Status Card with golden-orange monogram badge (*"TG"*), explorer & spaces count, and *"Enter your Campus"* button.
   - Filter tabs: *"Trending"*, *"My Spaces"*, *"Explore"*.
   - Community feed cards with horizontal polaroid photo card carousel.
7. **Frosted Profile Drawer (`lib/features/drawer/profile_drawer.dart`)**:
   - Real-time frosted glass blur backdrop (`BackdropFilter`).
   - 3D cartoon avatar with pink-cyan gradient ring, handle (`e/jashank06`), and student name.
   - Tactile menu items with outline stroke icons (*Jobs & Internships*, *Saved Cards*, *Collectibles*, *Settings*, *Support*).
   - Detached red-accented `Logout` button with confirmation modal.
8. **Missions, Rewards & Live Classes**:
   - Missions tab (`lib/features/missions/assignments_screen.dart`): Active assignments, streak fire counter, submissions.
   - Rewards tab (`lib/features/rewards/rewards_screen.dart`): XP points, collectibles, verifiable blockchain certificates.
   - Live Classes tab (`lib/features/live/live_classes_screen.dart`): Live stream badges, direct Zoom & Google Meet launch via `url_launcher`.

---

## 🚀 Running the Mobile App

### Prerequisites
- Flutter SDK (v3.38+ / Dart 3.10+)
- iOS Simulator (macOS / Xcode) or Android Emulator / Physical Device

### Launch Commands
```bash
# Navigate to the app directory
cd techgration_app

# Fetch dependencies
flutter pub get

# Run on available device or simulator
flutter run

# To run specifically on iOS Simulator
flutter run -d iPhone

# To run specifically on macOS desktop (for instant preview)
flutter run -d macos

# Run automated tests
flutter test
```

---

## 🔌 Backend Integration

The app connects directly to the production Next.js 16 backend:
- **Base URL**: `https://campus.techgration.live` (configurable in `lib/core/network/endpoints.dart`)
- **Authentication**: Session cookie (`tg_session`) and `Authorization: Bearer <token>` automatically handled by `ApiClient` (`Dio`).
- **Local Dev Toggle**: To connect to a local Next.js server, update `Endpoints.baseUrl` to `http://localhost:3000` or your machine's LAN IP (e.g. `http://192.168.1.X:3000`).
