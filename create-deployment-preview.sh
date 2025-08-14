#!/bin/bash

# 🚀 Simplified Deployment Script
# Creates a minimal deployment for testing the sidebar

echo "🚀 Matanuska Fleet Management - Creating Deployment Preview"
echo "=========================================================="

# Create deployment preview directory
echo "📦 Creating deployment directory..."
mkdir -p deploy-preview

# Create a simplified sidebar test HTML file
echo "📄 Creating sidebar test page..."
cat > deploy-preview/sidebar-test.html << 'EOL'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Matanuska Transport - Sidebar Test</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
    .app-container { display: flex; height: 100vh; }
    .content { flex-grow: 1; padding: 20px; background-color: #f9fafb; }
    
    /* Sidebar Styles */
    .sidebar {
      width: 256px;
      height: 100vh;
      background-color: #f3f4f6; /* Changed to gray-100 */
      border-right: 1px solid #e5e7eb;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      overflow-y: auto;
      flex-shrink: 0;
    }
    
    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e5e7eb;
      background-color: #fef3c7; /* yellow-100 */
    }
    
    .sidebar-title {
      font-weight: bold;
      font-size: 1.125rem;
      color: black;
    }
    
    .sidebar-category {
      padding: 0.5rem 1.5rem;
      margin-top: 1rem;
      margin-bottom: 0.25rem;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #6b7280; /* gray-500 */
    }
    
    .nav-item {
      padding: 0.5rem 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      transition: background-color 0.2s, color 0.2s;
      font-size: 0.875rem;
      color: #374151; /* gray-700 */
      margin-bottom: 2px;
    }
    
    .nav-item:hover {
      background-color: #e5e7eb; /* gray-200 */
    }
    
    .nav-item.active {
      background-color: #eff6ff; /* blue-50 */
      color: #2563eb; /* blue-600 */
      font-weight: 500;
    }
    
    .nav-item i {
      width: 20px;
      text-align: center;
    }
    
    .sub-nav {
      list-style: none;
      padding-left: 0;
      margin: 0;
    }
    
    .sub-nav .nav-item {
      padding-left: 3rem;
    }
    
    .nav-item.parent {
      justify-content: space-between;
    }
    
    .chevron {
      transition: transform 0.2s;
    }
    
    .chevron.down {
      transform: rotate(90deg);
    }
  </style>
</head>
<body>
  <div class="app-container">
    <!-- Sidebar Mockup -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <h1 class="sidebar-title">MATANUSKA TRANSPORT</h1>
      </div>
      
      <nav>
        <!-- Main Navigation -->
        <h3 class="sidebar-category">Main Navigation</h3>
        <ul class="sub-nav">
          <li class="nav-item" onclick="handleNavigation('dashboard')">
            <i class="fas fa-chart-line"></i>
            <span>Dashboard</span>
          </li>
        </ul>
        
        <!-- Core Business Operations -->
        <h3 class="sidebar-category">Core Business Operations</h3>
        <ul class="sub-nav">
          <!-- Trip Management -->
          <li class="nav-item parent" id="trips-parent">
            <div onclick="handleNavigation('trips')">
              <i class="fas fa-truck"></i>
              <span>Trip Management</span>
            </div>
            <span class="chevron" onclick="toggleSubnav('trips')"><i class="fas fa-chevron-right"></i></span>
          </li>
          <ul class="sub-nav" id="trips-subnav" style="display: none;">
            <li class="nav-item" onclick="handleNavigation('trips')">
              <span>Trip Dashboard</span>
            </li>
            <li class="nav-item" onclick="handleNavigation('trips/active')">
              <span>Active Trips</span>
            </li>
            <li class="nav-item" onclick="handleNavigation('trips/completed')">
              <span>Completed Trips</span>
            </li>
            <li class="nav-item" onclick="handleNavigation('trips/route-planning')">
              <span>Route Planning</span>
            </li>
          </ul>
          
          <!-- Invoice Management -->
          <li class="nav-item parent" id="invoices-parent">
            <div onclick="handleNavigation('invoices')">
              <i class="fas fa-file-invoice"></i>
              <span>Invoice Management</span>
            </div>
            <span class="chevron" onclick="toggleSubnav('invoices')"><i class="fas fa-chevron-right"></i></span>
          </li>
          <ul class="sub-nav" id="invoices-subnav" style="display: none;">
            <li class="nav-item" onclick="handleNavigation('invoices')">
              <span>Invoice Dashboard</span>
            </li>
            <li class="nav-item" onclick="handleNavigation('invoices/new')">
              <span>Create Invoice</span>
            </li>
          </ul>
          
          <!-- Diesel Management -->
          <li class="nav-item parent" id="diesel-parent">
            <div onclick="handleNavigation('diesel')">
              <i class="fas fa-gas-pump"></i>
              <span>Diesel Management</span>
            </div>
            <span class="chevron" onclick="toggleSubnav('diesel')"><i class="fas fa-chevron-right"></i></span>
          </li>
        </ul>
      </nav>
    </aside>
    
    <!-- Content Area -->
    <div class="content">
      <h1 class="text-2xl font-bold mb-4">Matanuska Transport Platform</h1>
      
      <div id="active-trips-container" class="mt-6 border rounded-lg shadow-sm p-6 bg-white">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Active Trips</h2>
        
        <div class="flex justify-between items-center mb-4">
          <div>
            <p class="text-gray-600">Manage ongoing trips and track their status</p>
          </div>
          <div class="flex space-x-2">
            <button class="px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-md flex items-center text-sm hover:bg-gray-50">
              <i class="fas fa-sync-alt mr-2"></i>
              Refresh
            </button>
            <button class="px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-md flex items-center text-sm hover:bg-gray-50">
              <i class="fas fa-download mr-2"></i>
              Export
            </button>
            <button class="px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-md flex items-center text-sm hover:bg-gray-50">
              <i class="fas fa-upload mr-2"></i>
              Import Trips
            </button>
            <button class="px-3 py-2 bg-blue-600 text-white rounded-md flex items-center text-sm hover:bg-blue-700">
              <i class="fas fa-plus mr-2"></i>
              Add Trip
            </button>
          </div>
        </div>
        
        <div class="mt-4">
          <div class="border rounded-lg overflow-hidden">
            <div class="p-4 bg-gray-50 border-b">
              <div class="grid grid-cols-3 gap-4">
                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1">Fleet</label>
                  <select class="w-full border-gray-300 rounded-md shadow-sm text-sm">
                    <option>All Fleets</option>
                    <option>Fleet 001</option>
                    <option>Fleet 002</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1">Driver</label>
                  <select class="w-full border-gray-300 rounded-md shadow-sm text-sm">
                    <option>All Drivers</option>
                    <option>John Doe</option>
                    <option>Jane Smith</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1">Client</label>
                  <select class="w-full border-gray-300 rounded-md shadow-sm text-sm">
                    <option>All Clients</option>
                    <option>Acme Corp</option>
                    <option>Globex Industries</option>
                  </select>
                </div>
              </div>
              <div class="mt-4 flex justify-end">
                <button class="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                  Clear Filters
                </button>
              </div>
            </div>
            
            <!-- Trip Cards -->
            <div class="divide-y">
              <!-- Trip 1 -->
              <div class="hover:bg-gray-50 transition-colors">
                <div class="flex flex-wrap items-center justify-between bg-blue-50 border-b border-blue-200 px-4 py-2">
                  <div class="flex items-center gap-2">
                    <i class="fas fa-truck text-blue-500"></i>
                    <span class="font-semibold text-blue-900">Fleet 001</span>
                    <span class="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Active</span>
                  </div>
                  <div class="flex gap-2">
                    <button class="p-1 text-gray-500 hover:text-gray-700">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button class="p-1 text-gray-500 hover:text-gray-700">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="p-1 text-gray-500 hover:text-gray-700">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
                <div class="p-4">
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p class="text-xs text-gray-500">Driver</p>
                      <p class="font-medium">John Doe</p>
                    </div>
                    <div>
                      <p class="text-xs text-gray-500">Client</p>
                      <p class="font-medium">Acme Corp</p>
                    </div>
                    <div>
                      <p class="text-xs text-gray-500">Route</p>
                      <p class="font-medium">Accra to Kumasi</p>
                    </div>
                    <div>
                      <p class="text-xs text-gray-500">Revenue</p>
                      <p class="font-medium">$2,500.00</p>
                    </div>
                  </div>
                  <div class="mt-4 flex flex-wrap justify-between items-center">
                    <div class="flex items-center gap-4">
                      <div>
                        <p class="text-xs text-gray-500">Start Date</p>
                        <p class="text-sm">Jul 20, 2025</p>
                      </div>
                      <div>
                        <p class="text-xs text-gray-500">End Date</p>
                        <p class="text-sm">Jul 25, 2025</p>
                      </div>
                    </div>
                    <div class="flex gap-2 mt-2 sm:mt-0">
                      <button class="px-3 py-1 border border-green-500 text-green-500 rounded-md text-sm hover:bg-green-50">
                        Mark Shipped
                      </button>
                      <button class="px-3 py-1 border border-blue-500 text-blue-500 rounded-md text-sm hover:bg-blue-50">
                        Update Status
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Trip 2 -->
              <div class="hover:bg-gray-50 transition-colors">
                <div class="flex flex-wrap items-center justify-between bg-blue-50 border-b border-blue-200 px-4 py-2">
                  <div class="flex items-center gap-2">
                    <i class="fas fa-truck text-blue-500"></i>
                    <span class="font-semibold text-blue-900">Fleet 002</span>
                    <span class="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Active</span>
                  </div>
                  <div class="flex gap-2">
                    <button class="p-1 text-gray-500 hover:text-gray-700">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button class="p-1 text-gray-500 hover:text-gray-700">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="p-1 text-gray-500 hover:text-gray-700">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
                <div class="p-4">
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p class="text-xs text-gray-500">Driver</p>
                      <p class="font-medium">Jane Smith</p>
                    </div>
                    <div>
                      <p class="text-xs text-gray-500">Client</p>
                      <p class="font-medium">Globex Industries</p>
                    </div>
                    <div>
                      <p class="text-xs text-gray-500">Route</p>
                      <p class="font-medium">Tema to Takoradi</p>
                    </div>
                    <div>
                      <p class="text-xs text-gray-500">Revenue</p>
                      <p class="font-medium">$3,200.00</p>
                    </div>
                  </div>
                  <div class="mt-4 flex flex-wrap justify-between items-center">
                    <div class="flex items-center gap-4">
                      <div>
                        <p class="text-xs text-gray-500">Start Date</p>
                        <p class="text-sm">Jul 19, 2025</p>
                      </div>
                      <div>
                        <p class="text-xs text-gray-500">End Date</p>
                        <p class="text-sm">Jul 24, 2025</p>
                      </div>
                    </div>
                    <div class="flex gap-2 mt-2 sm:mt-0">
                      <button class="px-3 py-1 border border-green-500 text-green-500 rounded-md text-sm hover:bg-green-50">
                        Mark Shipped
                      </button>
                      <button class="px-3 py-1 border border-blue-500 text-blue-500 rounded-md text-sm hover:bg-blue-50">
                        Update Status
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="bg-yellow-100 p-4 rounded shadow mt-6">
        <h2 class="text-lg font-semibold mb-2">About This Test:</h2>
        <p>This is a simplified version of the Matanuska Transport Platform.</p>
        <p class="mt-2">The sidebar color has been changed to grey as requested.</p>
        <p class="mt-2">The Active Trips functionality is mocked up here for demonstration.</p>
      </div>
    </div>
  </div>

  <script>
    // Navigation handler
    function handleNavigation(route) {
      const currentRoute = document.getElementById('current-route');
      if (currentRoute) {
        currentRoute.textContent = route;
      }
      console.log('Navigation to:', route);
      
      // Update UI based on route
      if (route === 'trips/active') {
        document.getElementById('active-trips-container').style.display = 'block';
      }
      
      // Highlight active item
      document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
      });
      
      // Find the clicked item and add active class
      const items = document.querySelectorAll('.nav-item');
      items.forEach(item => {
        if (item.getAttribute('onclick') && 
            item.getAttribute('onclick').includes(`'${route}'`)) {
          item.classList.add('active');
        }
      });
    }
    
    // Toggle subnav display
    function toggleSubnav(id) {
      const subnav = document.getElementById(`${id}-subnav`);
      const chevron = document.querySelector(`#${id}-parent .chevron i`);
      
      if (subnav.style.display === 'none') {
        subnav.style.display = 'block';
        chevron.classList.add('down');
      } else {
        subnav.style.display = 'none';
        chevron.classList.remove('down');
      }
    }
    
    // Initialize by expanding trips section and selecting active trips
    document.addEventListener('DOMContentLoaded', () => {
      toggleSubnav('trips');
      handleNavigation('trips/active');
    });
  </script>
</body>
</html>
EOL

# Create a simple index file
echo "📄 Creating index file..."
cat > deploy-preview/index.html << 'EOL'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0; url=sidebar-test.html">
  <title>Matanuska Transport Platform</title>
</head>
<body>
  <p>Redirecting to test page...</p>
  <script>
    window.location.href = "sidebar-test.html";
  </script>
</body>
</html>
EOL

# Create Netlify configuration files
echo "📄 Creating Netlify configuration..."
cat > deploy-preview/_redirects << 'EOL'
/*    /sidebar-test.html   200
EOL

cat > deploy-preview/netlify.toml << 'EOL'
# Netlify configuration file

[build]
  publish = "/"

[[redirects]]
  from = "/*"
  to = "/sidebar-test.html"
  status = 200
EOL

echo ""
echo "✅ Deployment preview created in 'deploy-preview' directory"
echo ""
echo "Next steps:"
echo "1. Run './deploy-netlify.sh' to deploy to Netlify"
echo "   OR"
echo "2. Test locally with: cd deploy-preview && python -m http.server 8000"
echo ""
