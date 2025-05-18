# Aviation Logistics Management System

A comprehensive logistics management system for aviation operations with both web and mobile interfaces. This system supports role-based access control and efficient logistics task management.

## Project Structure

This project consists of two main components:

### 1. Web Application (website/)

The web interface built with modern JavaScript frameworks:

```
website/
├── client/            # Frontend web application 
│   ├── src/           # Source code
│   │   ├── components/  # UI components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utilities and helpers
│   │   ├── pages/       # Page components
│   │   └── ...
├── server/            # Backend API server
│   ├── auth.ts        # Authentication logic
│   ├── db.ts          # Database connection
│   ├── routes.ts      # API routes
│   ├── storage.ts     # Data access layer
│   └── ...
└── shared/            # Shared code between client and server
    └── schema.ts      # Database schema and types
```

### 2. Mobile Application (mobile/)

A Flutter-based mobile application:

```
mobile/
├── lib/                   # Main source code directory
│   ├── models/            # Data models
│   ├── screens/           # UI screens
│   ├── services/          # Business logic and API services
│   └── main.dart          # Application entry point
├── assets/                # Asset files (images, fonts, etc.)
├── android/               # Android platform-specific code
├── ios/                   # iOS platform-specific code
└── pubspec.yaml           # Flutter dependencies and configuration
```

## Features

### Authentication
- Role-based access control (Admin, Manager, Employee)
- Login system with session management
- User profile management
- Password change functionality

### Dashboard
- Overview of tasks and system status
- Quick statistics and analytics
- Task distribution charts
- Recently assigned tasks

### Task Management
- Create, view, update, and delete tasks
- Task assignment to employees
- Task priority and status tracking
- Overdue task notifications

### Employee Management (Admin only)
- Manage employee accounts
- Assign roles and permissions
- Track employee performance
- View employee task history

## Technology Stack

### Web Application
- **Frontend**: React.js, TailwindCSS, Framer Motion
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with session-based auth

### Mobile Application
- **Framework**: Flutter (Dart)
- **State Management**: Provider
- **API Communication**: HTTP package
- **Local Storage**: SharedPreferences
- **UI Components**: Material Design and custom widgets

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL
- Flutter (for mobile app)

### Web App Setup
1. Clone the repository
2. Navigate to the project root
3. Install dependencies: `npm install`
4. Set up environment variables (see `.env.example`)
5. Start the application: `npm run dev`

### Mobile App Setup
1. Navigate to the mobile directory
2. Run `flutter pub get` to install dependencies
3. Update the API URL in the service files to point to your backend
4. Run `flutter run` to start the application

## Sample Users

### Admin Access
- Username: rafan
- Password: AL2023

### Manager Access
- Username: jazeel
- Password: AL2023

### Employee Access
- Username: sandeep
- Password: AL2023

## Team Members

- Rafan Ahamad Sheik (4PA23CS102)
- Shaikh Mohammed Shahil (4PA23CS127)
- Mustafa Muhammad (4PA22CS092)
- Mishab K (4PA23CS073)

## DBMS Mini Project Information

This Aviation Logistics Management System was developed as a DBMS Mini Project, showcasing:

- Relational database design with PostgreSQL
- Complex SQL queries and relationships
- Authentication and authorization implementation
- Integration of web and mobile interfaces
- Role-based access control