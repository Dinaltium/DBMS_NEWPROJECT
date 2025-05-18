class User {
  final int id;
  final String username;
  final String name;
  final String employeeId;
  final String? email;
  final String? phone;
  final String role;
  final String status;
  final DateTime? lastActive;

  User({
    required this.id,
    required this.username,
    required this.name,
    required this.employeeId,
    this.email,
    this.phone,
    required this.role,
    required this.status,
    this.lastActive,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      username: json['username'],
      name: json['name'],
      employeeId: json['employeeId'],
      email: json['email'],
      phone: json['phone'],
      role: json['role'],
      status: json['status'] ?? 'available',
      lastActive: json['lastActive'] != null 
          ? DateTime.parse(json['lastActive']) 
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'name': name,
      'employeeId': employeeId,
      'email': email,
      'phone': phone,
      'role': role,
      'status': status,
      'lastActive': lastActive?.toIso8601String(),
    };
  }

  bool get isAdmin => role == 'admin';
  bool get isManager => role == 'manager';
  bool get isEmployee => role == 'employee';
}