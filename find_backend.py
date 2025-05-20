import os
import re

def scan_for_backend_files(root_dir):
    """Scans directories for common backend server files."""
    backend_indicators = {
        'node.js': ['server.js', 'app.js', 'index.js', 'package.json'],
        'python': ['app.py', 'main.py', 'wsgi.py', 'requirements.txt', 'manage.py'],
        'java': ['pom.xml', 'build.gradle', 'application.properties'],
        'c#': ['Program.cs', 'Startup.cs', '.csproj'],
        'php': ['index.php', 'composer.json'],
        'database': ['schema.sql', 'migrations', 'models'],
        'api': ['routes', 'controllers', 'endpoints']
    }
    
    found_files = {}
    
    for root, dirs, files in os.walk(root_dir):
        # Skip mobile and website folders
        if 'mobile' in root or 'website' in root:
            continue
            
        for file in files:
            filepath = os.path.join(root, file)
            for tech, indicators in backend_indicators.items():
                for indicator in indicators:
                    if indicator in file or indicator in filepath:
                        if tech not in found_files:
                            found_files[tech] = []
                        found_files[tech].append(filepath)
                        break
    
    return found_files

def find_api_ports(root_dir):
    """Look for port definitions in files"""
    port_pattern = re.compile(r'(?:port|PORT)\s*[=:]\s*(\d+)')
    results = []
    
    for root, dirs, files in os.walk(root_dir):
        if 'mobile' in root or 'website' in root:
            continue
            
        for file in files:
            if file.endswith(('.js', '.py', '.java', '.properties', '.env', '.yml', '.yaml', '.json')):
                try:
                    filepath = os.path.join(root, file)
                    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                        matches = port_pattern.findall(content)
                        if matches:
                            results.append((filepath, matches))
                except:
                    pass
    
    return results

if __name__ == "__main__":
    root_directory = r"c:\DBMS\LogisticsTracker"
    print("Scanning for backend files...")
    backend_files = scan_for_backend_files(root_directory)
    
    print("\nPotential backend technologies found:")
    for tech, files in backend_files.items():
        print(f"\n{tech.upper()} files found:")
        for file in files[:5]:  # Show just the first 5 files
            print(f"  - {file}")
        if len(files) > 5:
            print(f"  - ...and {len(files) - 5} more")
    
    print("\nScanning for API port definitions...")
    port_files = find_api_ports(root_directory)
    
    print("\nPotential API port definitions:")
    for filepath, ports in port_files:
        print(f"  - {filepath}: Ports {', '.join(ports)}")
    
    print("\nINSTRUCTIONS:")
    print("1. Look for server.js, app.js, app.py, or similar files above")
    print("2. Check the port number used (likely 3000, 5000, or 8000)")
    print("3. Update your ApiConfig URL in mobile/lib/config/api_config.dart with this port")
    print("4. Make sure the backend server is running before testing the mobile app")
