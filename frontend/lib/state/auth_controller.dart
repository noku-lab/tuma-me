import 'package:flutter/foundation.dart';

import '../models/auth_user.dart';
import '../services/auth_api.dart';
import '../services/token_store.dart';

class AuthController extends ChangeNotifier {
  AuthController({
    required AuthApi api,
    required TokenStore tokenStore,
  })  : _api = api,
        _tokenStore = tokenStore;

  final AuthApi _api;
  final TokenStore _tokenStore;

  AuthUser? _user;
  AuthUser? get user => _user;

  String? _token;
  String? get token => _token;

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  String? _error;
  String? get error => _error;

  bool get isAuthed => _token != null && _user != null;

  Future<void> init() async {
    _setLoading(true);
    try {
      _token = await _tokenStore.read();
      if (_token != null) {
        _user = await _api.me(token: _token!);
      }
      _error = null;
    } catch (e) {
      _error = e.toString();
      _token = null;
      _user = null;
      await _tokenStore.clear();
    } finally {
      _setLoading(false);
    }
  }

  Future<void> signIn({required String email, required String password}) async {
    _setLoading(true);
    try {
      final result = await _api.login(email: email, password: password);
      _token = result.token;
      _user = result.user;
      _error = null;
      await _tokenStore.write(result.token);
    } catch (e) {
      _error = _friendlyError(e);
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> signUp({
    required String name,
    required String email,
    required String password,
    String? role,
    String? phone,
  }) async {
    _setLoading(true);
    try {
      final result = await _api.register(
        name: name,
        email: email,
        password: password,
        role: role,
        phone: phone,
      );
      _token = result.token;
      _user = result.user;
      _error = null;
      await _tokenStore.write(result.token);
    } catch (e) {
      _error = _friendlyError(e);
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> signOut() async {
    _token = null;
    _user = null;
    _error = null;
    notifyListeners();
    await _tokenStore.clear();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }

  void _setLoading(bool v) {
    _isLoading = v;
    notifyListeners();
  }

  String _friendlyError(Object e) {
    if (e is AuthApiException) return e.message;
    final s = e.toString();
    return s.startsWith('Exception: ') ? s.substring('Exception: '.length) : s;
  }
}

