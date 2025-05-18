import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:aviation_logistics/models/task.dart';
import 'package:aviation_logistics/services/auth_service.dart';

class TaskService extends ChangeNotifier {
  List<Task> _tasks = [];
  bool _isLoading = false;
  String? _errorMessage;
  final String _baseUrl = 'http://localhost:5000'; // Change to your server address

  List<Task> get tasks => _tasks;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  
  // Get all tasks
  Future<List<Task>> getAllTasks() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/api/tasks'),
        headers: await _getHeaders(),
      );
      
      _isLoading = false;
      
      if (response.statusCode == 200) {
        final List<dynamic> tasksJson = jsonDecode(response.body);
        _tasks = tasksJson.map((json) => Task.fromJson(json)).toList();
        notifyListeners();
        return _tasks;
      } else {
        final responseData = jsonDecode(response.body);
        _errorMessage = responseData['message'] ?? 'Failed to load tasks';
        notifyListeners();
        throw Exception(_errorMessage);
      }
    } catch (e) {
      _isLoading = false;
      _errorMessage = 'Network error: ${e.toString()}';
      notifyListeners();
      throw Exception(_errorMessage);
    }
  }
  
  // Get recent tasks
  Future<List<Task>> getRecentTasks([int limit = 5]) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/api/tasks/recent?limit=$limit'),
        headers: await _getHeaders(),
      );
      
      _isLoading = false;
      
      if (response.statusCode == 200) {
        final List<dynamic> tasksJson = jsonDecode(response.body);
        final recentTasks = tasksJson.map((json) => Task.fromJson(json)).toList();
        notifyListeners();
        return recentTasks;
      } else {
        final responseData = jsonDecode(response.body);
        _errorMessage = responseData['message'] ?? 'Failed to load recent tasks';
        notifyListeners();
        throw Exception(_errorMessage);
      }
    } catch (e) {
      _isLoading = false;
      _errorMessage = 'Network error: ${e.toString()}';
      notifyListeners();
      throw Exception(_errorMessage);
    }
  }
  
  // Get task by ID
  Future<Task> getTaskById(int id) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/api/tasks/$id'),
        headers: await _getHeaders(),
      );
      
      _isLoading = false;
      
      if (response.statusCode == 200) {
        final taskJson = jsonDecode(response.body);
        notifyListeners();
        return Task.fromJson(taskJson);
      } else {
        final responseData = jsonDecode(response.body);
        _errorMessage = responseData['message'] ?? 'Failed to load task';
        notifyListeners();
        throw Exception(_errorMessage);
      }
    } catch (e) {
      _isLoading = false;
      _errorMessage = 'Network error: ${e.toString()}';
      notifyListeners();
      throw Exception(_errorMessage);
    }
  }
  
  // Create task
  Future<Task> createTask(Map<String, dynamic> taskData) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/api/tasks'),
        headers: await _getHeaders(),
        body: jsonEncode(taskData),
      );
      
      _isLoading = false;
      
      if (response.statusCode == 201) {
        final taskJson = jsonDecode(response.body);
        final newTask = Task.fromJson(taskJson);
        _tasks.add(newTask);
        notifyListeners();
        return newTask;
      } else {
        final responseData = jsonDecode(response.body);
        _errorMessage = responseData['message'] ?? 'Failed to create task';
        notifyListeners();
        throw Exception(_errorMessage);
      }
    } catch (e) {
      _isLoading = false;
      _errorMessage = 'Network error: ${e.toString()}';
      notifyListeners();
      throw Exception(_errorMessage);
    }
  }
  
  // Update task
  Future<Task> updateTask(int id, Map<String, dynamic> taskData) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    
    try {
      final response = await http.put(
        Uri.parse('$_baseUrl/api/tasks/$id'),
        headers: await _getHeaders(),
        body: jsonEncode(taskData),
      );
      
      _isLoading = false;
      
      if (response.statusCode == 200) {
        final taskJson = jsonDecode(response.body);
        final updatedTask = Task.fromJson(taskJson);
        
        // Update task in list
        final index = _tasks.indexWhere((task) => task.id == id);
        if (index != -1) {
          _tasks[index] = updatedTask;
        }
        
        notifyListeners();
        return updatedTask;
      } else {
        final responseData = jsonDecode(response.body);
        _errorMessage = responseData['message'] ?? 'Failed to update task';
        notifyListeners();
        throw Exception(_errorMessage);
      }
    } catch (e) {
      _isLoading = false;
      _errorMessage = 'Network error: ${e.toString()}';
      notifyListeners();
      throw Exception(_errorMessage);
    }
  }
  
  // Delete task
  Future<void> deleteTask(int id) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    
    try {
      final response = await http.delete(
        Uri.parse('$_baseUrl/api/tasks/$id'),
        headers: await _getHeaders(),
      );
      
      _isLoading = false;
      
      if (response.statusCode == 204) {
        // Remove task from list
        _tasks.removeWhere((task) => task.id == id);
        notifyListeners();
      } else {
        final responseData = jsonDecode(response.body);
        _errorMessage = responseData['message'] ?? 'Failed to delete task';
        notifyListeners();
        throw Exception(_errorMessage);
      }
    } catch (e) {
      _isLoading = false;
      _errorMessage = 'Network error: ${e.toString()}';
      notifyListeners();
      throw Exception(_errorMessage);
    }
  }
  
  // Get headers for API requests
  Future<Map<String, String>> _getHeaders() async {
    return {
      'Content-Type': 'application/json',
    };
  }
}