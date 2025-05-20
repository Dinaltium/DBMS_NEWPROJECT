import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:aviation_logistics/models/user.dart';
import 'package:aviation_logistics/services/auth_service.dart';
import '../config/api_config.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  _ProfileScreenState createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _profileFormKey = GlobalKey<FormState>();
  final _passwordFormKey = GlobalKey<FormState>();

  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();

  final _currentPasswordController = TextEditingController();
  final _newPasswordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  bool _isEditingProfile = false;
  bool _obscureCurrentPassword = true;
  bool _obscureNewPassword = true;
  bool _obscureConfirmPassword = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);

    // Load user data into form
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final user = Provider.of<AuthService>(context, listen: false).currentUser;
      if (user != null) {
        _nameController.text = user.name;
        _emailController.text = user.email ?? '';
        _phoneController.text = user.phone ?? '';
      }
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _currentPasswordController.dispose();
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  void _saveProfile() async {
    if (_profileFormKey.currentState!.validate()) {
      final authService = Provider.of<AuthService>(context, listen: false);

      try {
        // This calls AuthService.updateProfile which already uses ApiConfig
        final success = await authService.updateProfile({
          'name': _nameController.text.trim(),
          'email': _emailController.text.trim(),
          'phone': _phoneController.text.trim(),
        });

        if (success && mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Profile updated successfully'),
              backgroundColor: Colors.green,
            ),
          );
          setState(() {
            _isEditingProfile = false;
          });
        }
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error updating profile: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  void _changePassword() async {
    if (_passwordFormKey.currentState!.validate()) {
      final authService = Provider.of<AuthService>(context, listen: false);

      if (_newPasswordController.text != _confirmPasswordController.text) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Passwords do not match'),
            backgroundColor: Colors.red,
          ),
        );
        return;
      }

      try {
        final success = await authService.changePassword(
          _currentPasswordController.text,
          _newPasswordController.text,
        );

        if (success && mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Password changed successfully'),
              backgroundColor: Colors.green,
            ),
          );

          // Clear password fields
          _currentPasswordController.clear();
          _newPasswordController.clear();
          _confirmPasswordController.clear();
        }
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error changing password: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authService = Provider.of<AuthService>(context);
    final User? user = authService.currentUser;
    final theme = Theme.of(context);

    if (user == null) {
      return Scaffold(
        appBar: AppBar(
          title: Text('Profile'),
        ),
        body: Center(
          child: Text('Please log in to view your profile'),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Text('Profile'),
        bottom: TabBar(
          controller: _tabController,
          tabs: [
            Tab(text: 'Profile Info'),
            Tab(text: 'Security'),
          ],
        ),
        actions: [
          if (_tabController.index == 0 && !_isEditingProfile)
            IconButton(
              icon: Icon(Icons.edit),
              onPressed: () {
                setState(() {
                  _isEditingProfile = true;
                });
              },
            ),
        ],
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // Profile Info Tab
          SingleChildScrollView(
            padding: EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Column(
                    children: [
                      CircleAvatar(
                        radius: 50,
                        backgroundColor: theme.primaryColor,
                        child: Text(
                          user.name.isNotEmpty
                              ? user.name[0].toUpperCase()
                              : 'U',
                          style: TextStyle(
                            fontSize: 36,
                            color: Colors.white,
                          ),
                        ),
                      ),
                      SizedBox(height: 16),
                      Text(
                        user.name,
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      SizedBox(height: 4),
                      Text(
                        '${user.role.substring(0, 1).toUpperCase()}${user.role.substring(1)}',
                        style: TextStyle(
                          fontSize: 16,
                          color: Colors.grey[600],
                        ),
                      ),
                    ],
                  ),
                ),
                SizedBox(height: 32),
                if (_isEditingProfile)
                  _buildEditProfileForm()
                else
                  _buildProfileInfo(user),
              ],
            ),
          ),

          // Security Tab
          SingleChildScrollView(
            padding: EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Change Password',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                SizedBox(height: 16),
                _buildChangePasswordForm(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProfileInfo(User user) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildInfoCard('Employee ID', user.employeeId),
        _buildInfoCard('Username', user.username),
        _buildInfoCard('Email', user.email ?? 'Not provided'),
        _buildInfoCard('Phone', user.phone ?? 'Not provided'),
        _buildInfoCard('Status',
            '${user.status.substring(0, 1).toUpperCase()}${user.status.substring(1)}'),
        _buildInfoCard(
            'Last Active',
            user.lastActive != null
                ? '${user.lastActive!.day}/${user.lastActive!.month}/${user.lastActive!.year}'
                : 'Unknown'),
      ],
    );
  }

  Widget _buildInfoCard(String label, String value) {
    return Card(
      margin: EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Row(
          children: [
            Expanded(
              flex: 2,
              child: Text(
                label,
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            Expanded(
              flex: 3,
              child: Text(value),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEditProfileForm() {
    return Form(
      key: _profileFormKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          TextFormField(
            controller: _nameController,
            decoration: InputDecoration(
              labelText: 'Full Name',
              border: OutlineInputBorder(),
            ),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Please enter your name';
              }
              return null;
            },
          ),
          SizedBox(height: 16),
          TextFormField(
            controller: _emailController,
            decoration: InputDecoration(
              labelText: 'Email',
              border: OutlineInputBorder(),
            ),
            keyboardType: TextInputType.emailAddress,
            validator: (value) {
              if (value != null && value.isNotEmpty) {
                if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$')
                    .hasMatch(value)) {
                  return 'Please enter a valid email';
                }
              }
              return null;
            },
          ),
          SizedBox(height: 16),
          TextFormField(
            controller: _phoneController,
            decoration: InputDecoration(
              labelText: 'Phone',
              border: OutlineInputBorder(),
            ),
            keyboardType: TextInputType.phone,
          ),
          SizedBox(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              TextButton(
                onPressed: () {
                  setState(() {
                    // Reset form and exit editing mode
                    final user =
                        Provider.of<AuthService>(context, listen: false)
                            .currentUser;
                    if (user != null) {
                      _nameController.text = user.name;
                      _emailController.text = user.email ?? '';
                      _phoneController.text = user.phone ?? '';
                    }
                    _isEditingProfile = false;
                  });
                },
                child: Text('Cancel'),
              ),
              SizedBox(width: 16),
              ElevatedButton(
                onPressed: authService.isLoading ? null : _saveProfile,
                child: authService.isLoading
                    ? CircularProgressIndicator(
                        valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                      )
                    : Text('Save Changes'),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildChangePasswordForm() {
    return Form(
      key: _passwordFormKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          TextFormField(
            controller: _currentPasswordController,
            obscureText: _obscureCurrentPassword,
            decoration: InputDecoration(
              labelText: 'Current Password',
              border: OutlineInputBorder(),
              suffixIcon: IconButton(
                icon: Icon(
                  _obscureCurrentPassword
                      ? Icons.visibility_off
                      : Icons.visibility,
                ),
                onPressed: () {
                  setState(() {
                    _obscureCurrentPassword = !_obscureCurrentPassword;
                  });
                },
              ),
            ),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Please enter your current password';
              }
              return null;
            },
          ),
          SizedBox(height: 16),
          TextFormField(
            controller: _newPasswordController,
            obscureText: _obscureNewPassword,
            decoration: InputDecoration(
              labelText: 'New Password',
              border: OutlineInputBorder(),
              suffixIcon: IconButton(
                icon: Icon(
                  _obscureNewPassword ? Icons.visibility_off : Icons.visibility,
                ),
                onPressed: () {
                  setState(() {
                    _obscureNewPassword = !_obscureNewPassword;
                  });
                },
              ),
            ),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Please enter a new password';
              }
              if (value.length < 6) {
                return 'Password must be at least 6 characters';
              }
              return null;
            },
          ),
          SizedBox(height: 16),
          TextFormField(
            controller: _confirmPasswordController,
            obscureText: _obscureConfirmPassword,
            decoration: InputDecoration(
              labelText: 'Confirm New Password',
              border: OutlineInputBorder(),
              suffixIcon: IconButton(
                icon: Icon(
                  _obscureConfirmPassword
                      ? Icons.visibility_off
                      : Icons.visibility,
                ),
                onPressed: () {
                  setState(() {
                    _obscureConfirmPassword = !_obscureConfirmPassword;
                  });
                },
              ),
            ),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Please confirm your new password';
              }
              if (value != _newPasswordController.text) {
                return 'Passwords do not match';
              }
              return null;
            },
          ),
          SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: authService.isLoading ? null : _changePassword,
              style: ElevatedButton.styleFrom(
                padding: EdgeInsets.symmetric(vertical: 16),
              ),
              child: authService.isLoading
                  ? CircularProgressIndicator(
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                    )
                  : Text('Change Password'),
            ),
          ),
        ],
      ),
    );
  }
}
