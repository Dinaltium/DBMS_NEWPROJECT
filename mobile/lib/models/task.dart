class Task {
  final int id;
  final String title;
  final String? description;
  final String status;
  final String priority;
  final int? assignedToId;
  final int createdById;
  final DateTime? dueDate;
  final DateTime createdAt;
  final DateTime updatedAt;
  
  // For UI purposes
  String? assigneeName;
  String? creatorName;

  Task({
    required this.id,
    required this.title,
    this.description,
    required this.status,
    required this.priority,
    this.assignedToId,
    required this.createdById,
    this.dueDate,
    required this.createdAt,
    required this.updatedAt,
    this.assigneeName,
    this.creatorName,
  });

  factory Task.fromJson(Map<String, dynamic> json) {
    return Task(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      status: json['status'],
      priority: json['priority'],
      assignedToId: json['assignedToId'],
      createdById: json['createdById'],
      dueDate: json['dueDate'] != null ? DateTime.parse(json['dueDate']) : null,
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
      assigneeName: json['assigneeName'],
      creatorName: json['creatorName'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'status': status,
      'priority': priority,
      'assignedToId': assignedToId,
      'createdById': createdById,
      'dueDate': dueDate?.toIso8601String(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  bool get isPending => status == 'pending';
  bool get isInProgress => status == 'in_progress';
  bool get isCompleted => status == 'completed';
  bool get isOverdue => status == 'overdue';
  
  bool get isLowPriority => priority == 'low';
  bool get isMediumPriority => priority == 'medium';
  bool get isHighPriority => priority == 'high';
}