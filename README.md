# AI Expense Tracker

A full-stack expense tracker with an Expo React Native app and a Node/Express backend. The mobile app can parse bank SMS on Android and populate dashboard, expenses, and income automatically.

## Repo layout

- `frontend/` – Expo + React Native app (Expo Router)
- `backend/` – Node/Express API (MongoDB via Mongoose)

## Prerequisites

- Node.js LTS (>= 18)
- Android Studio (SDK + AVD) for Android builds
- JDK 17 (Temurin / Adoptium recommended)
- MongoDB instance (local or hosted) for backend

## Quick start

### 1) Backend (Node/Express)

Create a `.env` in `backend/`:

```
MONGODB_URI=mongodb://localhost:27017/ai-expense-tracker
PORT=5000
```

Install and run:

```powershell
cd backend
npm install
npm run dev
```

The server listens on `http://localhost:5000`.

### 2) Frontend (Expo RN)

Install dependencies:

```powershell
cd frontend
npm install
```

Run web or Metro locally:

```powershell
# Web (for quick UI preview)
npm run web

# Metro dev server only
npm start
```

## Android dev build (required for SMS access)

Expo Go cannot access SMS or other custom native modules. Build and install a dev build instead.

1. Ensure Android SDK and an emulator are available in Android Studio.
2. Set JDK 17 for the session:

```powershell
$env:JAVA_HOME = 'C:\\Program Files\\Eclipse Adoptium\\jdk-17.0.16.8-hotspot'
$env:Path = "$env:JAVA_HOME\\bin;$env:Path"
java -version
javac -version
```

3. Make sure Gradle uses JDK 17 regardless of JAVA_HOME (already configured):

- `frontend/android/gradle.properties` contains:
  - `org.gradle.java.home=C:\\Program Files\\Eclipse Adoptium\\jdk-17.0.16.8-hotspot`

4. Build and install the dev build:

```powershell
cd frontend
npm run android
```

If multiple devices are connected, pass `--device` to target the emulator.

### Android permissions

- The app requests `READ_SMS` (and `RECEIVE_SMS`) on startup. Allow them to enable SMS parsing.
- In a dev build, the app reads the inbox and parses transactions with tolerant heuristics.

## How SMS parsing works

- Module: `react-native-get-sms-android` (Android only)
- Utility: `frontend/utils/smsImporter.ts`
  - Requests `READ_SMS` at runtime
  - Lists inbox messages and parses amounts/merchant/mode
  - Tolerant of sender formats and currency tokens (`INR`, `NR`, `Rs`, `₹`)
  - Fallback pass if sender filter yields 0 results
  - Debug logs in dev: `[smsImporter] raw=X parsed=Y`

### Screens reading SMS directly

- Dashboard (`frontend/app/(tabs)/index.tsx`)
  - Computes Total Balance, Income, Expense from SMS
  - Shows recent transactions (latest 10)
  - Pull-to-refresh and auto-refresh on focus/foreground

- Expenses (`frontend/app/(tabs)/expenses.tsx`)
  - Lists expenses (amount < 0)
  - Auto-refresh on tab focus and app foreground

- Income (`frontend/app/(tabs)/income.tsx`)
  - Lists incomes (amount > 0)
  - Auto-refresh on tab focus and app foreground

## Emulator tips

- Use `10.0.2.2` to reach your host’s `localhost` from the emulator. The app defaults to this for any backend calls.
- To seed test SMS, use the emulator or ADB to send messages that contain `debited`, `credited`, `payment`, `UPI`, `POS`, etc.

## Common issues

- `JAVA_HOME is set to an invalid directory`
  - Set it for the session as shown above or edit `org.gradle.java.home` in `gradle.properties`.

- “Native SMS module not available. You must run a Dev Build”
  - You’re likely in Expo Go; install and open the dev build instead.

- “VirtualizedLists should never be nested…”
  - Avoid ScrollView-wrapping lists. The screens here use FlatList or Views with flex.

## Scripts

Backend:

```powershell
cd backend
npm run dev
```

Frontend:

```powershell
cd frontend
npm start        # metro
npm run web      # web
npm run android  # dev build (required for SMS)
```

## License

MIT
