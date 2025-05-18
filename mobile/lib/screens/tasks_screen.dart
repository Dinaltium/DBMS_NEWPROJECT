import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:aviation_logistics/models/task.dart';
import 'package:aviation_logistics/services/auth_service.dart';
import 'package:intl/intl.dart';
import 'package:flutter_slidable/flutter_slidable.dart';

class TasksScreen extends StatefulWidget {
  const TasksScreen({Key? key}) : super(key: key);

  @override
  _TasksScreenState createState() => _TasksScreenState();
}

class _TasksScreenState extends State<TasksScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<Task> _tasks = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    _loadTasks();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadTasks() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      // Simulate API call
      await Future.delayed(Duration(seconds: 1));
      
      // Sample tasks data
      final sampleTasks = [
        Task(
          id: 1,
          title: 'Inspect aircraft before departure',
          description: 'Conduct a thorough pre-flight inspection of all aircraft systems and components.',
          status: 'completed',
          priority: 'high',
          createdById: 1,
          assignedToId: 3,
          dueDate: DateTime.now().subtract(Duration(days: 1)),
          createdAt: DateTime.now().subtract(Duration(days: 2)),
          updatedAt: DateTime.now().subtract(Duration(days: 1)),
          assigneeName: 'Sandeep Kumar',
          creatorName: 'Rafan Ahamad Sheik',
        ),
        Task(
          id: 2,
          title: 'Check cargo manifest',
          description: 'Review and verify all cargo documentation for Flight AV-421.',
          status: 'in_progress',
          priority: 'medium',
          createdById: 1,
          assignedToId: 3,
          dueDate: DateTime.now().add(Duration(days: 1)),
          createdAt: DateTime.now().subtract(Duration(days: 1)),
          updatedAt: DateTime.now().subtract(Duration(hours: 5)),
          assigneeName: 'Sandeep Kumar',
          creatorName: 'Rafan Ahamad Sheik',
        ),
        Task(
          id: 3,
          title: 'Schedule maintenance for Boeing 737',
          description: 'Coordinate with maintenance team for routine inspection and repairs.',
          status: 'pending',
          priority: 'high',
          createdById: 1,
          assignedToId: 2,
          dueDate: DateTime.now().add(Duration(days: 3)),
          createdAt: DateTime.now().subtract(Duration(hours: 12)),
          updatedAt: DateTime.now().subtract(Duration(hours: 12)),
          assigneeName: 'T Mohammed Jazeel',
          creatorName: 'Rafan Ahamad Sheik',
        ),
        Task(
          id: 4,
          title: 'Update flight crew scheduling',
          description: 'Adjust crew assignments based on revised flight operations.',
          status: 'pending',
          priority: 'medium',
          createdById: 2,
          assignedToId: 3,
          dueDate: DateTime.now().add(Duration(days: 2)),
          createdAt: DateTime.now().subtract(Duration(days: 1)),
          updatedAt: DateTime.now().subtract(Duration(days: 1)),
          assigneeName: 'Sandeep Kumar',
          creatorName: 'T Mohammed Jazeel',
        ),
        Task(
          id: 5,
          title: 'Prepare monthly logistics report',
          description: 'Compile data on flight operations, cargo handling, and resource utilization.',
          status: 'overdue',
          priority: 'high',
          createdById: 1,
          assignedToId: 2,
          dueDate: DateTime.now().subtract(Duration(days: 2)),
          createdAt: DateTime.now().subtract(Duration(days: 10)),
          updatedAt: DateTime.now().subtract(Duration(days: 3)),
          assigneeName: 'T Mohammed Jazeel',
          creatorName: 'Rafan Ahamad Sheik',
        ),
        Task(
          id: 6,
          title: 'Coordinate airspace clearance',
          description: 'Obtain necessary permissions for upcoming international flights.',
          status: 'completed',
          priority: 'high',
          createdById: 2,
          assignedToId: 3,
          dueDate: DateTime.now().subtract(Duration(days: 1)),
          createdAt: DateTime.now().subtract(Duration(days: 5)),
          updatedAt: DateTime.now().subtract(Duration(days: 2)),
          assigneeName: 'Sandeep Kumar',
          creatorName: 'T Mohammed Jazeel',
        ),
        Task(
          id: 7,
          title: 'Review fuel consumption metrics',
          description: 'Analyze fuel efficiency data and identify optimization opportunities.',
          status: 'overdue',
          priority: 'medium',
          createdById: 1,
          assignedToId: 3,
          dueDate: DateTime.now().subtract(Duration(days: 3)),
          createdAt: DateTime.now().subtract(Duration(days: 7)),
          updatedAt: DateTime.now().subtract(Duration(days: 1)),
          assigneeName: 'Sandeep Kumar',
          creatorName: 'Rafan Ahamad Sheik',
        ),
      ];
      
      setState(() {
        _tasks = sampleTasks;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  List<Task> _getFilteredTasks(String status) {
    if (status == 'all') {
      return _tasks;
    }
    return _tasks.where((task) => task.status == status).toList();
  }

  @override
  Widget build(BuildContext context) {
    final authService = Provider.of<AuthService>(context);
    final user = authService.currentUser;
    final theme = Theme.of(context);
    final isAdmin = user?.isAdmin ?? false;
    final isManager = user?.isManager ?? false;
    
    return Scaffold(
      appBar: AppBar(
        title: Text('Tasks'),
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          tabs: [
            Tab(text: 'All Tasks'),
            Tab(text: 'Pending'),
            Tab(text: 'In Progress'),
            Tab(text: 'Completed'),
          ],
        ),
        actions: [
          IconButton(
            icon: Icon(Icons.search),
            onPressed: () {
              // Implement search
            },
          ),
          IconButton(
            icon: Icon(Icons.filter_list),
            onPressed: () {
              // Implement filter
            },
          ),
        ],
      ),
      body: _isLoading
          ? Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.error_outline, size: 48, color: Colors.red),
                      SizedBox(height: 16),
                      Text(
                        'Error loading tasks',
                        style: TextStyle(fontSize: 18),
                      ),
                      SizedBox(height: 8),
                      Text(_error!),
                      SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: _loadTasks,
                        child: Text('Retry'),
                      ),
                    ],
                  ),
                )
              : TabBarView(
                  controller: _tabController,
                  children: [
                    _buildTaskList(_getFilteredTasks('all')),
                    _buildTaskList(_getFilteredTasks('pending')),
                    _buildTaskList(_getFilteredTasks('in_progress')),
                    _buildTaskList(_getFilteredTasks('completed')),
                  ],
                ),
      floatingActionButton: (isAdmin || isManager) ? FloatingActionButton(
        onPressed: () {
          _showAddTaskDialog(context);
        },
        child: Icon(Icons.add),
        tooltip: 'Add Task',
      ) : null,
    );
  }

  Widget _buildTaskList(List<Task> tasks) {
    if (tasks.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.task_alt,
              size: 64,
              color: Colors.grey[400],
            ),
            SizedBox(height: 16),
            Text(
              'No tasks found',
              style: TextStyle(
                fontSize: 18,
                color: Colors.grey[600],
              ),
            ),
            SizedBox(height: 8),
            Text(
              'Tasks assigned to you will appear here',
              style: TextStyle(
                color: Colors.grey[500],
              ),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadTasks,
      child: ListView.builder(
        padding: EdgeInsets.all(16),
        itemCount: tasks.length,
        itemBuilder: (context, index) {
          final task = tasks[index];
          return _buildTaskCard(task);
        },
      ),
    );
  }

  Widget _buildTaskCard(Task task) {
    Color statusColor;
    IconData statusIcon;
    String statusText;
    
    switch (task.status) {
      case 'completed':
        statusColor = Colors.green;
        statusIcon = Icons.check_circle;
        statusText = 'Completed';
        break;
      case 'in_progress':
        statusColor = Colors.orange;
        statusIcon = Icons.sync;
        statusText = 'In Progress';
        break;
      case 'overdue':
        statusColor = Colors.red;
        statusIcon = Icons.warning;
        statusText = 'Overdue';
        break;
      default:
        statusColor = Colors.blue;
        statusIcon = Icons.pending_actions;
        statusText = 'Pending';
    }
    
    Color priorityColor;
    switch (task.priority) {
      case 'high':
        priorityColor = Colors.red;
        break;
      case 'medium':
        priorityColor = Colors.orange;
        break;
      default:
        priorityColor = Colors.green;
    }
    
    final user = Provider.of<AuthService>(context, listen: false).currentUser;
    final canEdit = user?.isAdmin == true || user?.isManager == true || task.assignedToId == user?.id;
    
    return Slidable(
      endActionPane: ActionPane(
        motion: ScrollMotion(),
        children: [
          if (canEdit && task.status != 'completed')
            SlidableAction(
              onPressed: (_) {
                // Implement mark as complete
              },
              backgroundColor: Colors.green,
              foregroundColor: Colors.white,
              icon: Icons.check,
              label: 'Complete',
            ),
          if (user?.isAdmin == true || user?.isManager == true)
            SlidableAction(
              onPressed: (_) {
                // Implement delete
              },
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
              icon: Icons.delete,
              label: 'Delete',
            ),
        ],
      ),
      child: Card(
        margin: EdgeInsets.only(bottom: 16),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        child: InkWell(
          onTap: () {
            _showTaskDetailsDialog(context, task);
          },
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: statusColor.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            statusIcon,
                            color: statusColor,
                            size: 16,
                          ),
                          SizedBox(width: 4),
                          Text(
                            statusText,
                            style: TextStyle(
                              color: statusColor,
                              fontWeight: FontWeight.w500,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                    SizedBox(width: 8),
                    Container(
                      padding: EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: priorityColor.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        '${task.priority.substring(0, 1).toUpperCase()}${task.priority.substring(1)} Priority',
                        style: TextStyle(
                          color: priorityColor,
                          fontWeight: FontWeight.w500,
                          fontSize: 12,
                        ),
                      ),
                    ),
                    Spacer(),
                    Text(
                      task.dueDate != null
                          ? DateFormat('MMM d').format(task.dueDate!)
                          : 'No due date',
                      style: TextStyle(
                        color: task.dueDate != null &&
                                task.dueDate!.isBefore(DateTime.now()) &&
                                task.status != 'completed'
                            ? Colors.red
                            : Colors.grey[600],
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 12),
                Text(
                  task.title,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                if (task.description != null && task.description!.isNotEmpty) ...[
                  SizedBox(height: 8),
                  Text(
                    task.description!,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey[600],
                    ),
                  ),
                ],
                SizedBox(height: 12),
                Row(
                  children: [
                    Icon(
                      Icons.person_outline,
                      size: 16,
                      color: Colors.grey[600],
                    ),
                    SizedBox(width: 4),
                    Text(
                      'Assigned to: ${task.assigneeName ?? 'Unassigned'}',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey[600],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showTaskDetailsDialog(BuildContext context, Task task) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(task.title),
        content: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              if (task.description != null && task.description!.isNotEmpty) ...[
                Text(
                  'Description',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                SizedBox(height: 8),
                Text(task.description!),
                SizedBox(height: 16),
              ],
              Text(
                'Status',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
              SizedBox(height: 8),
              Text(task.status),
              SizedBox(height: 16),
              Text(
                'Priority',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
              SizedBox(height: 8),
              Text(task.priority),
              SizedBox(height: 16),
              Text(
                'Assignee',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
              SizedBox(height: 8),
              Text(task.assigneeName ?? 'Unassigned'),
              SizedBox(height: 16),
              Text(
                'Due Date',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
              SizedBox(height: 8),
              Text(
                task.dueDate != null
                    ? DateFormat('MMMM d, y').format(task.dueDate!)
                    : 'No due date',
              ),
              SizedBox(height: 16),
              Text(
                'Created By',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
              SizedBox(height: 8),
              Text(task.creatorName ?? 'Unknown'),
              SizedBox(height: 16),
              Text(
                'Created At',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
              SizedBox(height: 8),
              Text(DateFormat('MMMM d, y').format(task.createdAt)),
              SizedBox(height: 16),
              Text(
                'Last Updated',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
              SizedBox(height: 8),
              Text(DateFormat('MMMM d, y').format(task.updatedAt)),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
            },
            child: Text('Close'),
          ),
          if (task.status != 'completed') 
            ElevatedButton(
              onPressed: () {
                Navigator.of(context).pop();
                // Implement updating task status
              },
              child: Text('Mark Complete'),
            ),
        ],
      ),
    );
  }

  void _showAddTaskDialog(BuildContext context) {
    final _titleController = TextEditingController();
    final _descriptionController = TextEditingController();
    String _priority = 'medium';
    DateTime? _dueDate;
    int? _assigneeId;
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Add New Task'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: _titleController,
                decoration: InputDecoration(
                  labelText: 'Title',
                  border: OutlineInputBorder(),
                ),
              ),
              SizedBox(height: 16),
              TextField(
                controller: _descriptionController,
                decoration: InputDecoration(
                  labelText: 'Description',
                  border: OutlineInputBorder(),
                ),
                maxLines: 3,
              ),
              SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: _priority,
                decoration: InputDecoration(
                  labelText: 'Priority',
                  border: OutlineInputBorder(),
                ),
                items: [
                  DropdownMenuItem(
                    value: 'low',
                    child: Text('Low'),
                  ),
                  DropdownMenuItem(
                    value: 'medium',
                    child: Text('Medium'),
                  ),
                  DropdownMenuItem(
                    value: 'high',
                    child: Text('High'),
                  ),
                ],
                onChanged: (value) {
                  if (value != null) {
                    _priority = value;
                  }
                },
              ),
              SizedBox(height: 16),
              // Add date picker and assignee dropdown here
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
            },
            child: Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              if (_titleController.text.isNotEmpty) {
                Navigator.of(context).pop();
                // Implement creating task
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Task created successfully'),
                    backgroundColor: Colors.green,
                  ),
                );
              }
            },
            child: Text('Create'),
          ),
        ],
      ),
    );
  }
}