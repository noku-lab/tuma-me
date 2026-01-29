class ApiConfig {
  /// Override at build time:
  /// - Android emulator backend: `http://10.0.2.2:3000`
  /// - iOS simulator backend: `http://localhost:3000`
  /// - Physical device backend: `http://<your-lan-ip>:3000`
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:3000',
  );
}

