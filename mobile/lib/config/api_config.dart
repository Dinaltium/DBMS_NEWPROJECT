class ApiConfig {
  // Base URL of the backend API
  // If running on local development environment, use:
  // static String baseUrl = "http://localhost:port/api"; // Replace 'port' with actual port number  // If running on emulator with localhost backend, use:
  // The 10.0.2.2 IP is the special IP for Android emulator to access host machine's localhost
  static String baseUrl =
      "http://10.0.2.2:5000/api"; // Special IP for Android emulator to access host

  // Timeout duration for API requests (in seconds)
  static const int timeoutDuration = 30;
  // API endpoints
  static String get authEndpoint =>
      baseUrl; // Changed from "$baseUrl/auth" to directly use the base URL
  static String get tasksEndpoint => "$baseUrl/tasks";
  static String get employeesEndpoint => "$baseUrl/employees";
  static String get profileEndpoint => "$baseUrl/profile";

  // Configure the API URL
  static void configureApi(String url) {
    baseUrl = url;
  }
}
