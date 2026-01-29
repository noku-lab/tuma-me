# Flutter frontend (Sign In / Sign Up)

This folder contains a Flutter UI and an `AuthApi` client wired to:

- `POST http://localhost:3000/api/auth/login`
- `POST http://localhost:3000/api/auth/register`

## Ports (no confusion)

- **Backend API**: `http://localhost:3000`
- **Flutter Web UI** (browser): runs on whatever `--web-port` you choose (example `8000`)
- The Flutter app calls the backend using **`API_BASE_URL`** (defaults to `http://localhost:3000` in `lib/config/api_config.dart`)

## Prereqs

Install Flutter and add it to PATH: https://flutter.dev/docs/get-started/install

## Important: `localhost` on emulators

- **Android emulator**: use `http://10.0.2.2:3000` instead of `http://localhost:3000`
- **iOS simulator**: `http://localhost:3000` works
- **Physical device**: use your machine LAN IP (example `http://192.168.1.50:3000`)

This app reads the base URL from a build-time define:

```bash
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:3000
```

If you don’t pass it, it defaults to `http://localhost:3000`.

## Run

From this `frontend/` directory:

```bash
flutter pub get
flutter run --dart-define=API_BASE_URL=http://localhost:3000
```

## If you want the Flutter web app on port 8000

This changes the **UI port** (not the API port):

```bash
flutter run -d chrome --web-port 8000 --dart-define=API_BASE_URL=http://localhost:3000
```

## What’s included

- `SignInScreen` -> calls `/api/auth/login`
- `SignUpScreen` -> calls `/api/auth/register` (name/email/password/role/phone)
- token persistence via `shared_preferences`
- basic home screen showing the current user and a logout button
