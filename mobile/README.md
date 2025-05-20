# Aviation Logistics Management System - Mobile App

This is the mobile application component of the Aviation Logistics Management System, built with Flutter to complement the web application.

## Project Structure

```
mobile/
├── lib/                   # Main source code directory
│   ├── models/            # Data models
│   │   ├── user.dart      # User model
│   │   └── task.dart      # Task model
│   ├── screens/           # UI screens
│   │   ├── login_screen.dart        # Login screen
│   │   ├── dashboard_screen.dart    # Main dashboard
│   │   ├── tasks_screen.dart        # Task management
│   │   ├── employees_screen.dart    # Employee management
│   │   └── profile_screen.dart      # User profile
│   ├── services/          # Business logic and API services
│   │   ├── auth_service.dart        # Authentication service
│   │   └── task_service.dart        # Task management service
│   └── main.dart          # Application entry point
├── assets/                # Asset files (images, fonts, etc.)
│   ├── images/            # Image assets
│   └── icons/             # Icon assets
├── android/               # Android platform-specific code
├── ios/                   # iOS platform-specific code
└── pubspec.yaml           # Flutter dependencies and configuration
```

## Features

### Authentication

- Login with username and password
- Role-based access control (Admin, Manager, Employee)
- User profile management
- Password change functionality

### Dashboard

- Overview of tasks and status
- Quick stats on task completion
- Task distribution visualization
- Recently assigned tasks

### Task Management

- View all tasks with filtering options
- Create, edit, and delete tasks (Admin/Manager only)
- Mark tasks as complete/in progress
- Task priority management
- Task assignment to employees

### Employee Management (Admin only)

- View all employees
- Add, edit, and delete employees
- Change employee roles and status
- Employee details view

## Technology Stack

- **Flutter**: UI framework for cross-platform mobile development
- **Provider**: State management
- **HTTP**: API communication with backend
- **SharedPreferences**: Local storage for user data
- **FL Chart**: Data visualization
- **Flutter Slidable**: Swipe actions for tasks
- **Animate Do**: Animation library for smooth transitions

## Setup Instructions

1. Ensure Flutter is installed on your development machine
2. Clone the repository
3. Navigate to the mobile directory
4. Run `flutter pub get` to install dependencies
5. Configure the API URL in the `lib/config/api_config.dart` file:
   ```dart
   // Update this line with your backend API URL
   static String baseUrl = "https://your-backend-api.com/api";
   ```
   Alternatively, you can set it programmatically in `main.dart`:
   ```dart
   ApiConfig.configureApi("https://your-backend-api.com/api");
   ```
6. Run `flutter run` to start the application

## Usage

### Admin Access

- Username: rafan
- Password: AL2023
- Full access to all features including employee management

### Manager Access

- Username: jazeel
- Password: AL2023
- Access to task management and limited employee features

### Employee Access

- Username: sandeep
- Password: AL2023
- Access to assigned tasks and personal profile

## Team

- Rafan Ahamad Sheik (4PA23CS102)
- Shaikh Mohammed Shahil (4PA23CS127)
- Mustafa Muhammad (4PA22CS092)
- Mishab K (4PA23CS073)

## About

This mobile application is part of the DBMS Mini Project: Aviation Logistics Management System, designed to provide a comprehensive logistics management solution for aviation operations. The mobile app complements the web interface, allowing on-the-go access to critical logistics information and tasks.
