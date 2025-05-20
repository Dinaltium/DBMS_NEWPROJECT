import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:aviation_logistics/models/user.dart';
import '../config/api_config.dart';

class AuthService extends ChangeNotifier {
  User? _currentUser;
  bool _isLoading = false;
  String? _errorMessage;

  User? get currentUser => _currentUser;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  // Check if user is authenticated
  Future<bool> isAuthenticated() async {
    final prefs = await SharedPreferences.getInstance();
    final userData = prefs.getString('user');

    if (userData != null) {
      try {
        _currentUser = User.fromJson(jsonDecode(userData));
        // Validate token with server
        final response = await http.get(
          Uri.parse('${ApiConfig.authEndpoint}/user'),
          headers: await _getHeaders(),
        );

        if (response.statusCode == 200) {
          final responseData = jsonDecode(response.body);
          _currentUser = User.fromJson(responseData);
          await _saveUserData(_currentUser!);
          notifyListeners();
          return true;
        } else {
          await logout();
          return false;
        }
      } catch (e) {
        await logout();
        return false;
      }
    }
    return false;
  }

  // Login method
  Future<bool> login(String username, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      // Print the URL to debug
      final loginUrl = '${ApiConfig.authEndpoint}/login';
      print('Attempting login at: $loginUrl');

      final response = await http.post(
        Uri.parse(loginUrl),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'username': username,
          'password': password,
        }),
      );

      _isLoading = false;
      print('Login response status: ${response.statusCode}');
      print('Login response body: ${response.body}');

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        print('Parsed response data: $responseData');

        // Create user from response data
        _currentUser = User.fromJson(responseData);
        print('User object created: ${_currentUser?.name}');

        // Save user data to shared preferences
        await _saveUserData(_currentUser!);
        print('User data saved to preferences');

        notifyListeners();
        return true;
      } else {
        try {
          final responseData = jsonDecode(response.body);
          _errorMessage = responseData['message'] ?? 'Login failed';
        } catch (e) {
          _errorMessage = 'Login failed: ${response.body}';
        }
        notifyListeners();
        return false;
      }
    } catch (e) {
      print('Login error: $e');
      _isLoading = false;
      _errorMessage = 'Network error: ${e.toString()}';
      notifyListeners();
      return false;
    }
  }

  // Logout method
  Future<void> logout() async {
    _isLoading = true;
    notifyListeners();

    try {
      print('Attempting to log out');
      await http.post(
        Uri.parse('${ApiConfig.authEndpoint}/logout'),
        headers: await _getHeaders(),
      );
      print('Logout API call completed');
    } catch (e) {
      // Ignore errors during logout
      print('Logout API error (ignoring): $e');
    }

    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('user');

    _currentUser = null;
    _isLoading = false;
    notifyListeners();
  }

  // Update user profile
  Future<bool> updateProfile(Map<String, dynamic> profileData) async {
    if (_currentUser == null) return false;

    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await http.put(
        Uri.parse('${ApiConfig.authEndpoint}/users/${_currentUser!.id}'),
        headers: await _getHeaders(),
        body: jsonEncode(profileData),
      );

      _isLoading = false;

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        _currentUser = User.fromJson(responseData);
        await _saveUserData(_currentUser!);
        notifyListeners();
        return true;
      } else {
        final responseData = jsonDecode(response.body);
        _errorMessage = responseData['message'] ?? 'Failed to update profile';
        notifyListeners();
        return false;
      }
    } catch (e) {
      _isLoading = false;
      _errorMessage = 'Network error: ${e.toString()}';
      notifyListeners();
      return false;
    }
  }

  // Change password
  Future<bool> changePassword(
      String currentPassword, String newPassword) async {
    if (_currentUser == null) return false;

    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await http.post(
        Uri.parse('${ApiConfig.authEndpoint}/change-password'),
        headers: await _getHeaders(),
        body: jsonEncode({
          'currentPassword': currentPassword,
          'newPassword': newPassword,
        }),
      );

      _isLoading = false;

      if (response.statusCode == 200) {
        notifyListeners();
        return true;
      } else {
        final responseData = jsonDecode(response.body);
        _errorMessage = responseData['message'] ?? 'Failed to change password';
        notifyListeners();
        return false;
      }
    } catch (e) {
      _isLoading = false;
      _errorMessage = 'Network error: ${e.toString()}';
      notifyListeners();
      return false;
    }
  }

  // Save user data to local storage
  Future<void> _saveUserData(User user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('user', jsonEncode(user.toJson()));
  }

  // Get headers with auth token for API requests
  Future<Map<String, String>> _getHeaders() async {
    return {
      'Content-Type': 'application/json',
    };
  }
}
