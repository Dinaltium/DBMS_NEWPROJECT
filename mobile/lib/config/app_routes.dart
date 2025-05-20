import 'package:flutter/material.dart';

/// A helper class to manage application navigation routes
class AppRoutes {
  // Route names
  static const String login = '/login';
  static const String dashboard = '/dashboard';
  static const String tasks = '/tasks';
  static const String profile = '/profile';
  static const String settings = '/settings';

  /// Navigate to dashboard and clear navigation history
  static void navigateToDashboard(BuildContext context) {
    Navigator.pushNamedAndRemoveUntil(context, dashboard, (route) => false);
  }

  /// Navigate to login and clear navigation history
  static void navigateToLogin(BuildContext context) {
    Navigator.pushNamedAndRemoveUntil(context, login, (route) => false);
  }
}
