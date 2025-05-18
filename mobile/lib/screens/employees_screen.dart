import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:aviation_logistics/models/user.dart';
import 'package:aviation_logistics/services/auth_service.dart';

class EmployeesScreen extends StatefulWidget {
  const EmployeesScreen({Key? key}) : super(key: key);

  @override
  _EmployeesScreenState createState() => _EmployeesScreenState();
}

class _EmployeesScreenState extends State<EmployeesScreen> {
  List<User> _employees = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadEmployees();
  }

  Future<void> _loadEmployees() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    // For demo, using sample data
    await Future.delayed(Duration(seconds: 1));
    setState(() {
      _employees = [
        User(
          id: 1,
          name: 'Rafan Ahamad Sheik',
          username: 'rafan',
          employeeId: 'AL001',
          email: 'rafan@aviation.com',
          phone: '9876543210',
          role: 'admin',
          status: 'available',
        ),
        User(
          id: 2,
          name: 'T Mohammed Jazeel',
          username: 'jazeel',
          employeeId: 'AL002',
          email: 'jazeel@aviation.com',
          phone: '9876543211',
          role: 'manager',
          status: 'available',
        ),
        User(
          id: 3,
          name: 'Sandeep Kumar',
          username: 'sandeep',
          employeeId: 'AL003',
          email: 'sandeep@aviation.com',
          phone: '9876543212',
          role: 'employee',
          status: 'busy',
        ),
        User(
          id: 4,
          name: 'Shaikh Mohammed Shahil',
          username: 'shahil',
          employeeId: 'AL004',
          email: 'shahil@aviation.com',
          phone: '9876543213',
          role: 'employee',
          status: 'available',
        ),
        User(
          id: 5,
          name: 'Mustafa Muhammad',
          username: 'mustafa',
          employeeId: 'AL005',
          email: 'mustafa@aviation.com',
          phone: '9876543214',
          role: 'employee',
          status: 'away',
        ),
        User(
          id: 6,
          name: 'Mishab K',
          username: 'mishab',
          employeeId: 'AL006',
          email: 'mishab@aviation.com',
          phone: '9876543215',
          role: 'employee',
          status: 'available',
        ),
      ];
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final authService = Provider.of<AuthService>(context);
    final user = authService.currentUser;
    final isAdmin = user?.isAdmin ?? false;
    
    return Scaffold(
      appBar: AppBar(
        title: Text('Employees'),
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
                        'Error loading employees',
                        style: TextStyle(fontSize: 18),
                      ),
                      SizedBox(height: 8),
                      Text(_error!),
                      SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: _loadEmployees,
                        child: Text('Retry'),
                      ),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _loadEmployees,
                  child: _employees.isEmpty
                      ? Center(
                          child: Text('No employees found'),
                        )
                      : ListView.builder(
                          padding: EdgeInsets.all(16),
                          itemCount: _employees.length,
                          itemBuilder: (context, index) {
                            final employee = _employees[index];
                            return _buildEmployeeCard(employee, isAdmin);
                          },
                        ),
                ),
      floatingActionButton: isAdmin
          ? FloatingActionButton(
              onPressed: () {
                _showAddEmployeeDialog(context);
              },
              child: Icon(Icons.add),
              tooltip: 'Add Employee',
            )
          : null,
    );
  }

  Widget _buildEmployeeCard(User employee, bool isAdmin) {
    Color statusColor;
    
    switch (employee.status) {
      case 'available':
        statusColor = Colors.green;
        break;
      case 'busy':
        statusColor = Colors.orange;
        break;
      case 'away':
        statusColor = Colors.red;
        break;
      default:
        statusColor = Colors.grey;
    }
    
    return Card(
      margin: EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: InkWell(
        onTap: () {
          _showEmployeeDetailsDialog(context, employee, isAdmin);
        },
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: EdgeInsets.all(16),
          child: Row(
            children: [
              CircleAvatar(
                radius: 28,
                backgroundColor: _getRoleColor(employee.role),
                child: Text(
                  employee.name.isNotEmpty ? employee.name[0].toUpperCase() : 'U',
                  style: TextStyle(
                    fontSize: 24,
                    color: Colors.white,
                  ),
                ),
              ),
              SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      employee.name,
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    SizedBox(height: 4),
                    Text(
                      employee.employeeId,
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey[600],
                      ),
                    ),
                    SizedBox(height: 4),
                    Text(
                      '${employee.role.substring(0, 1).toUpperCase()}${employee.role.substring(1)}',
                      style: TextStyle(
                        fontSize: 14,
                        color: _getRoleColor(employee.role),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
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
                        Container(
                          width: 8,
                          height: 8,
                          decoration: BoxDecoration(
                            color: statusColor,
                            shape: BoxShape.circle,
                          ),
                        ),
                        SizedBox(width: 4),
                        Text(
                          '${employee.status.substring(0, 1).toUpperCase()}${employee.status.substring(1)}',
                          style: TextStyle(
                            color: statusColor,
                            fontWeight: FontWeight.w500,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                  SizedBox(height: 8),
                  if (isAdmin)
                    IconButton(
                      icon: Icon(Icons.more_vert),
                      onPressed: () {
                        _showEmployeeActionsMenu(context, employee);
                      },
                    ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Color _getRoleColor(String role) {
    switch (role) {
      case 'admin':
        return Colors.indigo;
      case 'manager':
        return Colors.blue;
      default:
        return Colors.teal;
    }
  }

  void _showEmployeeDetailsDialog(BuildContext context, User employee, bool isAdmin) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(employee.name),
        content: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Center(
                child: CircleAvatar(
                  radius: 50,
                  backgroundColor: _getRoleColor(employee.role),
                  child: Text(
                    employee.name.isNotEmpty ? employee.name[0].toUpperCase() : 'U',
                    style: TextStyle(
                      fontSize: 36,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
              SizedBox(height: 24),
              _buildInfoRow('Employee ID', employee.employeeId),
              _buildInfoRow('Username', employee.username),
              _buildInfoRow('Email', employee.email ?? 'Not provided'),
              _buildInfoRow('Phone', employee.phone ?? 'Not provided'),
              _buildInfoRow(
                'Role', 
                '${employee.role.substring(0, 1).toUpperCase()}${employee.role.substring(1)}'
              ),
              _buildInfoRow(
                'Status', 
                '${employee.status.substring(0, 1).toUpperCase()}${employee.status.substring(1)}'
              ),
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
          if (isAdmin)
            ElevatedButton(
              onPressed: () {
                Navigator.of(context).pop();
                _showEditEmployeeDialog(context, employee);
              },
              child: Text('Edit'),
            ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: TextStyle(
              color: Colors.grey[600],
              fontSize: 12,
            ),
          ),
          SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  void _showEmployeeActionsMenu(BuildContext context, User employee) {
    showModalBottomSheet(
      context: context,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (context) => Padding(
        padding: EdgeInsets.symmetric(vertical: 16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: Icon(Icons.edit),
              title: Text('Edit Employee'),
              onTap: () {
                Navigator.pop(context);
                _showEditEmployeeDialog(context, employee);
              },
            ),
            ListTile(
              leading: Icon(Icons.delete, color: Colors.red),
              title: Text('Delete Employee', style: TextStyle(color: Colors.red)),
              onTap: () {
                Navigator.pop(context);
                _showDeleteEmployeeDialog(context, employee);
              },
            ),
          ],
        ),
      ),
    );
  }

  void _showAddEmployeeDialog(BuildContext context) {
    final _nameController = TextEditingController();
    final _usernameController = TextEditingController();
    final _employeeIdController = TextEditingController();
    final _emailController = TextEditingController();
    final _phoneController = TextEditingController();
    String _role = 'employee';
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Add New Employee'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: _nameController,
                decoration: InputDecoration(
                  labelText: 'Full Name',
                  border: OutlineInputBorder(),
                ),
              ),
              SizedBox(height: 16),
              TextField(
                controller: _usernameController,
                decoration: InputDecoration(
                  labelText: 'Username',
                  border: OutlineInputBorder(),
                ),
              ),
              SizedBox(height: 16),
              TextField(
                controller: _employeeIdController,
                decoration: InputDecoration(
                  labelText: 'Employee ID',
                  border: OutlineInputBorder(),
                ),
              ),
              SizedBox(height: 16),
              TextField(
                controller: _emailController,
                decoration: InputDecoration(
                  labelText: 'Email',
                  border: OutlineInputBorder(),
                ),
                keyboardType: TextInputType.emailAddress,
              ),
              SizedBox(height: 16),
              TextField(
                controller: _phoneController,
                decoration: InputDecoration(
                  labelText: 'Phone',
                  border: OutlineInputBorder(),
                ),
                keyboardType: TextInputType.phone,
              ),
              SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: _role,
                decoration: InputDecoration(
                  labelText: 'Role',
                  border: OutlineInputBorder(),
                ),
                items: [
                  DropdownMenuItem(
                    value: 'employee',
                    child: Text('Employee'),
                  ),
                  DropdownMenuItem(
                    value: 'manager',
                    child: Text('Manager'),
                  ),
                  DropdownMenuItem(
                    value: 'admin',
                    child: Text('Admin'),
                  ),
                ],
                onChanged: (value) {
                  if (value != null) {
                    _role = value;
                  }
                },
              ),
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
              if (_nameController.text.isNotEmpty &&
                  _usernameController.text.isNotEmpty &&
                  _employeeIdController.text.isNotEmpty) {
                Navigator.of(context).pop();
                // Implement creating employee
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Employee created successfully'),
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

  void _showEditEmployeeDialog(BuildContext context, User employee) {
    final _nameController = TextEditingController(text: employee.name);
    final _emailController = TextEditingController(text: employee.email ?? '');
    final _phoneController = TextEditingController(text: employee.phone ?? '');
    String _role = employee.role;
    String _status = employee.status;
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Edit Employee'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: _nameController,
                decoration: InputDecoration(
                  labelText: 'Full Name',
                  border: OutlineInputBorder(),
                ),
              ),
              SizedBox(height: 16),
              TextField(
                controller: _emailController,
                decoration: InputDecoration(
                  labelText: 'Email',
                  border: OutlineInputBorder(),
                ),
                keyboardType: TextInputType.emailAddress,
              ),
              SizedBox(height: 16),
              TextField(
                controller: _phoneController,
                decoration: InputDecoration(
                  labelText: 'Phone',
                  border: OutlineInputBorder(),
                ),
                keyboardType: TextInputType.phone,
              ),
              SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: _role,
                decoration: InputDecoration(
                  labelText: 'Role',
                  border: OutlineInputBorder(),
                ),
                items: [
                  DropdownMenuItem(
                    value: 'employee',
                    child: Text('Employee'),
                  ),
                  DropdownMenuItem(
                    value: 'manager',
                    child: Text('Manager'),
                  ),
                  DropdownMenuItem(
                    value: 'admin',
                    child: Text('Admin'),
                  ),
                ],
                onChanged: (value) {
                  if (value != null) {
                    _role = value;
                  }
                },
              ),
              SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: _status,
                decoration: InputDecoration(
                  labelText: 'Status',
                  border: OutlineInputBorder(),
                ),
                items: [
                  DropdownMenuItem(
                    value: 'available',
                    child: Text('Available'),
                  ),
                  DropdownMenuItem(
                    value: 'busy',
                    child: Text('Busy'),
                  ),
                  DropdownMenuItem(
                    value: 'away',
                    child: Text('Away'),
                  ),
                ],
                onChanged: (value) {
                  if (value != null) {
                    _status = value;
                  }
                },
              ),
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
              if (_nameController.text.isNotEmpty) {
                Navigator.of(context).pop();
                // Implement updating employee
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Employee updated successfully'),
                    backgroundColor: Colors.green,
                  ),
                );
              }
            },
            child: Text('Save'),
          ),
        ],
      ),
    );
  }

  void _showDeleteEmployeeDialog(BuildContext context, User employee) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Delete Employee'),
        content: Text('Are you sure you want to delete ${employee.name}?'),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
            },
            child: Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
            ),
            onPressed: () {
              Navigator.of(context).pop();
              // Implement deleting employee
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Employee deleted successfully'),
                  backgroundColor: Colors.green,
                ),
              );
            },
            child: Text('Delete'),
          ),
        ],
      ),
    );
  }
}