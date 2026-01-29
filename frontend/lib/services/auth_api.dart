import 'dart:convert';

import 'package:http/http.dart' as http;

import '../config/api_config.dart';
import '../models/auth_user.dart';

class AuthResult {
  const AuthResult({required this.token, required this.user});

  final String token;
  final AuthUser user;
}

class AuthApiException implements Exception {
  AuthApiException(this.message, {this.statusCode});
  final String message;
  final int? statusCode;

  @override
  String toString() => 'AuthApiException($statusCode): $message';
}

class AuthApi {
  AuthApi({http.Client? client}) : _client = client ?? http.Client();

  final http.Client _client;

  Uri _uri(String path) => Uri.parse('${ApiConfig.baseUrl}$path');

  Future<AuthResult> login({
    required String email,
    required String password,
  }) async {
    final res = await _client.post(
      _uri('/api/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );
    return _parseAuthResult(res);
  }

  Future<AuthResult> register({
    required String name,
    required String email,
    required String password,
    String? role,
    String? phone,
  }) async {
    final payload = <String, dynamic>{
      'name': name,
      'email': email,
      'password': password,
      if (role != null && role.trim().isNotEmpty) 'role': role.trim(),
      if (phone != null && phone.trim().isNotEmpty) 'phone': phone.trim(),
    };

    final res = await _client.post(
      _uri('/api/auth/register'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(payload),
    );

    return _parseAuthResult(res);
  }

  Future<AuthUser> me({required String token}) async {
    final res = await _client.get(
      _uri('/api/auth/me'),
      headers: {'Authorization': 'Bearer $token'},
    );

    final json = _decodeJson(res);
    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw AuthApiException(_extractError(json) ?? 'Request failed', statusCode: res.statusCode);
    }
    return AuthUser.fromJson(json);
  }

  AuthResult _parseAuthResult(http.Response res) {
    final json = _decodeJson(res);
    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw AuthApiException(_extractError(json) ?? 'Request failed', statusCode: res.statusCode);
    }

    final token = (json['token'] ?? '').toString();
    final userJson = json['user'];
    if (token.isEmpty || userJson is! Map<String, dynamic>) {
      throw AuthApiException('Unexpected response from server', statusCode: res.statusCode);
    }
    return AuthResult(token: token, user: AuthUser.fromJson(userJson));
  }

  Map<String, dynamic> _decodeJson(http.Response res) {
    try {
      final body = res.body.trim().isEmpty ? '{}' : res.body;
      final decoded = jsonDecode(body);
      if (decoded is Map<String, dynamic>) return decoded;
      return {'_raw': decoded};
    } catch (_) {
      return {'error': 'Invalid response from server'};
    }
  }

  String? _extractError(Map<String, dynamic> json) {
    final err = json['error'];
    if (err is String && err.trim().isNotEmpty) return err.trim();
    return null;
  }
}

