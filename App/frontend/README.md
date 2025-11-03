# Frontend

## Google Sign-In (Android + Web)

Google Sign-In is implemented:
- Web: Firebase popup/redirect
- Android (Expo): Expo AuthSession + Firebase credential

### Prerequisites
1. Enable Google provider in Firebase Authentication.
2. Create Google OAuth 2.0 Client IDs in Google Cloud Console:
   - Web application client ID (recommended)
   - Android client ID (optional if using Expo proxy; we use a Web client ID for ID token flow)
3. Add the Expo Redirect URI to your OAuth client Authorized redirect URIs:
   - Run `npx expo whoami` and check your app slug in `app.json`.
   - Redirect URI (proxy): `https://auth.expo.io/@YOUR_EXPO_USERNAME/YOUR_APP_SLUG`
4. Add env vars to `app.config` or system env (Expo requires `EXPO_PUBLIC_` prefix):
   - `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID="<your web client id>"`
   - (Optional) `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID="<your web client id>"`

> Note: For a quick start, you can reuse the Web client ID for the ID token flow on Android via Expo proxy.

### How it works
On Android, we request an ID token via Google OAuth (OpenID Connect). We then sign in to Firebase using:

`GoogleAuthProvider.credential(idToken)` → `signInWithCredential(auth, credential)`

### Troubleshooting
- Error: Missing EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID → add the env var.
- Error: disallowed_useragent → ensure you use Expo proxy (we set `useProxy: true`).
- Error: redirect_uri_mismatch → add your Expo redirect URI in the Google OAuth client’s Authorized redirect URIs.

# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
