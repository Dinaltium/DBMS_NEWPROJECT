import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:aviation_logistics/services/auth_service.dart';
import 'package:aviation_logistics/services/task_service.dart';
import 'package:aviation_logistics/screens/login_screen.dart';
import 'package:aviation_logistics/screens/dashboard_screen.dart';
import 'package:aviation_logistics/config/app_routes.dart';
import 'config/api_config.dart';

void main() {
  // Your backend server is running on port 5000, not 3000
  // For Android Emulator:
  ApiConfig.configureApi("http://10.0.2.2:5000/api");
  // For web:
  // ApiConfig.configureApi("http://localhost:5000/api");
  // For physical device (use your computer's IP):
  // ApiConfig.configureApi("http://192.168.x.x:5000/api");

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthService()),
        ChangeNotifierProvider(create: (_) => TaskService()),
      ],
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Aviation Logistics',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.blue,
        brightness: Brightness.light,
        visualDensity: VisualDensity.adaptivePlatformDensity,
        fontFamily: 'Poppins',
        scaffoldBackgroundColor: Colors.grey[50],
        appBarTheme: AppBarTheme(
          elevation: 0,
          backgroundColor: Colors.white,
          iconTheme: IconThemeData(color: Colors.blue[800]),
          titleTextStyle: TextStyle(
            color: Colors.blue[800],
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            foregroundColor: Colors.white,
            backgroundColor: Colors.blue[700],
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            padding: const EdgeInsets.symmetric(
              horizontal: 24,
              vertical: 14,
            ),
          ),
        ),
        cardTheme: CardTheme(
          elevation: 2,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
        ),
      ),
      darkTheme: ThemeData(
        primarySwatch: Colors.blue,
        brightness: Brightness.dark,
        visualDensity: VisualDensity.adaptivePlatformDensity,
        fontFamily: 'Poppins',
        scaffoldBackgroundColor: const Color(0xFF121212),
        appBarTheme: AppBarTheme(
          elevation: 0,
          backgroundColor: const Color(0xFF1E1E1E),
          iconTheme: IconThemeData(color: Colors.blue[200]),
          titleTextStyle: TextStyle(
            color: Colors.blue[200],
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            foregroundColor: Colors.white,
            backgroundColor: Colors.blue[700],
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            padding: const EdgeInsets.symmetric(
              horizontal: 24,
              vertical: 14,
            ),
          ),
        ),
        cardTheme: CardTheme(
          color: const Color(0xFF252525),
          elevation: 2,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
        ),
      ),
      themeMode: ThemeMode.system,
      home: AuthWrapper(),
      routes: {
        AppRoutes.login: (context) => const LoginScreen(),
        AppRoutes.dashboard: (context) => const DashboardScreen(),
      },
    );
  }
}

class AuthWrapper extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final authService = Provider.of<AuthService>(context);
    return FutureBuilder(
      future: authService.isAuthenticated(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(
            body: Center(
              child: CircularProgressIndicator(),
            ),
          );
        }

        if (snapshot.hasData && snapshot.data == true) {
          return const DashboardScreen();
        }

        return const LoginScreen();
      },
    );
  }
}
