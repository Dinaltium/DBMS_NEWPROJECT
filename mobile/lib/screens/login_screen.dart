import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:aviation_logistics/services/auth_service.dart';
import 'package:animate_do/animate_do.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isEmployee = true;
  bool _rememberMe = false;
  bool _obscurePassword = true;

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _login() async {
    if (_formKey.currentState!.validate()) {
      final authService = Provider.of<AuthService>(context, listen: false);
      
      final success = await authService.login(
        _usernameController.text.trim(), 
        _passwordController.text.trim()
      );
      
      if (success && mounted) {
        Navigator.pushReplacementNamed(context, '/dashboard');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authService = Provider.of<AuthService>(context);
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          child: Container(
            height: MediaQuery.of(context).size.height - 
                MediaQuery.of(context).padding.top - 
                MediaQuery.of(context).padding.bottom,
            child: Column(
              children: [
                Expanded(
                  child: Row(
                    children: [
                      // Left side - Hero section
                      Expanded(
                        child: Container(
                          color: isDark 
                              ? Color(0xFF1A237E) 
                              : Color(0xFF3F51B5),
                          padding: EdgeInsets.all(24),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              FadeInDown(
                                duration: Duration(milliseconds: 500),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'DBMS Mini Project:',
                                      style: TextStyle(
                                        color: Colors.white70,
                                        fontSize: 16,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                    SizedBox(height: 8),
                                    Text(
                                      'Aviation Logistics',
                                      style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 28,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    SizedBox(height: 16),
                                    Text(
                                      'Created by',
                                      style: TextStyle(
                                        color: Colors.white70,
                                        fontSize: 16,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              SizedBox(height: 24),
                              Expanded(
                                child: FadeInUp(
                                  duration: Duration(milliseconds: 800),
                                  delay: Duration(milliseconds: 300),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      _buildTeamMemberCard(
                                        'Rafan Ahamad Sheik',
                                        '4PA23CS102',
                                        Icons.person,
                                      ),
                                      SizedBox(height: 16),
                                      _buildTeamMemberCard(
                                        'Shaikh Mohammed Shahil',
                                        '4PA23CS127',
                                        Icons.person,
                                      ),
                                      SizedBox(height: 16),
                                      _buildTeamMemberCard(
                                        'Mustafa Muhammad',
                                        '4PA22CS092',
                                        Icons.person,
                                      ),
                                      SizedBox(height: 16),
                                      _buildTeamMemberCard(
                                        'Mishab K',
                                        '4PA23CS073',
                                        Icons.person,
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                              FadeIn(
                                delay: Duration(milliseconds: 1000),
                                child: Text(
                                  '© 2025 Aviation Logistics',
                                  style: TextStyle(
                                    color: Colors.white54,
                                    fontSize: 12,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      
                      // Right side - Login form
                      Expanded(
                        child: Container(
                          padding: EdgeInsets.all(32),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              FadeInDown(
                                duration: Duration(milliseconds: 500),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Welcome Back',
                                      style: TextStyle(
                                        fontSize: 28,
                                        fontWeight: FontWeight.bold,
                                        color: theme.textTheme.headline6?.color,
                                      ),
                                    ),
                                    SizedBox(height: 8),
                                    Text(
                                      'Sign in to your account',
                                      style: TextStyle(
                                        fontSize: 16,
                                        color: theme.textTheme.caption?.color,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              SizedBox(height: 32),
                              
                              // User type toggle
                              FadeInDown(
                                delay: Duration(milliseconds: 200),
                                duration: Duration(milliseconds: 500),
                                child: Container(
                                  decoration: BoxDecoration(
                                    color: isDark 
                                        ? Colors.grey[800] 
                                        : Colors.grey[200],
                                    borderRadius: BorderRadius.circular(30),
                                  ),
                                  child: Row(
                                    children: [
                                      Expanded(
                                        child: GestureDetector(
                                          onTap: () => setState(() => _isEmployee = true),
                                          child: Container(
                                            padding: EdgeInsets.symmetric(vertical: 12),
                                            decoration: BoxDecoration(
                                              color: _isEmployee 
                                                  ? (isDark ? Colors.blue[800] : Colors.blue)
                                                  : Colors.transparent,
                                              borderRadius: BorderRadius.circular(30),
                                            ),
                                            child: Center(
                                              child: Text(
                                                'Employee',
                                                style: TextStyle(
                                                  color: _isEmployee 
                                                      ? Colors.white 
                                                      : theme.textTheme.bodyText2?.color,
                                                  fontWeight: _isEmployee 
                                                      ? FontWeight.bold 
                                                      : FontWeight.normal,
                                                ),
                                              ),
                                            ),
                                          ),
                                        ),
                                      ),
                                      Expanded(
                                        child: GestureDetector(
                                          onTap: () => setState(() => _isEmployee = false),
                                          child: Container(
                                            padding: EdgeInsets.symmetric(vertical: 12),
                                            decoration: BoxDecoration(
                                              color: !_isEmployee 
                                                  ? (isDark ? Colors.blue[800] : Colors.blue)
                                                  : Colors.transparent,
                                              borderRadius: BorderRadius.circular(30),
                                            ),
                                            child: Center(
                                              child: Text(
                                                'Admin',
                                                style: TextStyle(
                                                  color: !_isEmployee 
                                                      ? Colors.white 
                                                      : theme.textTheme.bodyText2?.color,
                                                  fontWeight: !_isEmployee 
                                                      ? FontWeight.bold 
                                                      : FontWeight.normal,
                                                ),
                                              ),
                                            ),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                              SizedBox(height: 32),
                              
                              // Login form
                              Expanded(
                                child: FadeInUp(
                                  delay: Duration(milliseconds: 400),
                                  duration: Duration(milliseconds: 500),
                                  child: Form(
                                    key: _formKey,
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.stretch,
                                      children: [
                                        TextFormField(
                                          controller: _usernameController,
                                          decoration: InputDecoration(
                                            labelText: 'Username',
                                            prefixIcon: Icon(Icons.person_outline),
                                            border: OutlineInputBorder(
                                              borderRadius: BorderRadius.circular(12),
                                            ),
                                          ),
                                          validator: (value) {
                                            if (value == null || value.isEmpty) {
                                              return 'Please enter your username';
                                            }
                                            return null;
                                          },
                                        ),
                                        SizedBox(height: 24),
                                        TextFormField(
                                          controller: _passwordController,
                                          obscureText: _obscurePassword,
                                          decoration: InputDecoration(
                                            labelText: 'Password',
                                            prefixIcon: Icon(Icons.lock_outline),
                                            suffixIcon: IconButton(
                                              icon: Icon(
                                                _obscurePassword 
                                                  ? Icons.visibility_off 
                                                  : Icons.visibility,
                                              ),
                                              onPressed: () {
                                                setState(() {
                                                  _obscurePassword = !_obscurePassword;
                                                });
                                              },
                                            ),
                                            border: OutlineInputBorder(
                                              borderRadius: BorderRadius.circular(12),
                                            ),
                                          ),
                                          validator: (value) {
                                            if (value == null || value.isEmpty) {
                                              return 'Please enter your password';
                                            }
                                            return null;
                                          },
                                        ),
                                        SizedBox(height: 24),
                                        Row(
                                          children: [
                                            Checkbox(
                                              value: _rememberMe,
                                              onChanged: (value) {
                                                setState(() {
                                                  _rememberMe = value ?? false;
                                                });
                                              },
                                            ),
                                            Text('Remember me'),
                                            Spacer(),
                                            TextButton(
                                              onPressed: () {
                                                // TODO: Implement forgot password
                                              },
                                              child: Text('Forgot password?'),
                                            ),
                                          ],
                                        ),
                                        SizedBox(height: 24),
                                        ElevatedButton(
                                          onPressed: authService.isLoading ? null : _login,
                                          style: ElevatedButton.styleFrom(
                                            padding: EdgeInsets.symmetric(vertical: 16),
                                            shape: RoundedRectangleBorder(
                                              borderRadius: BorderRadius.circular(12),
                                            ),
                                          ),
                                          child: authService.isLoading
                                              ? CircularProgressIndicator(
                                                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                                )
                                              : Row(
                                                  mainAxisAlignment: MainAxisAlignment.center,
                                                  children: [
                                                    Icon(Icons.login),
                                                    SizedBox(width: 8),
                                                    Text(
                                                      'Sign In',
                                                      style: TextStyle(
                                                        fontSize: 16,
                                                        fontWeight: FontWeight.bold,
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                              
                              if (authService.errorMessage != null)
                                FadeIn(
                                  child: Container(
                                    padding: EdgeInsets.all(12),
                                    margin: EdgeInsets.only(top: 16),
                                    decoration: BoxDecoration(
                                      color: Colors.red[100],
                                      borderRadius: BorderRadius.circular(8),
                                      border: Border.all(color: Colors.red),
                                    ),
                                    child: Row(
                                      children: [
                                        Icon(Icons.error_outline, color: Colors.red),
                                        SizedBox(width: 8),
                                        Expanded(
                                          child: Text(
                                            authService.errorMessage!,
                                            style: TextStyle(color: Colors.red[900]),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                                
                              SizedBox(height: 16),
                              FadeInUp(
                                delay: Duration(milliseconds: 600),
                                duration: Duration(milliseconds: 500),
                                child: Center(
                                  child: Text(
                                    'For demo, use credentials: Username: ${_isEmployee ? 'sandeep' : 'rafan'}, Password: AL2023',
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: Colors.grey,
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
  
  Widget _buildTeamMemberCard(String name, String usn, IconData icon) {
    return Row(
      children: [
        Container(
          padding: EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.2),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(
            icon,
            color: Colors.white,
            size: 20,
          ),
        ),
        SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                name,
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                ),
              ),
              SizedBox(height: 4),
              Text(
                usn,
                style: TextStyle(
                  color: Colors.white70,
                  fontSize: 12,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}