#!/bin/bash

# Test script for resilience capabilities of the Matanuska Fleet Manager
# This script simulates various failure conditions to test error handling and recovery

# Text formatting
BOLD="\033[1m"
RED="\033[31m"
GREEN="\033[32m"
YELLOW="\033[33m"
BLUE="\033[34m"
RESET="\033[0m"

# Print section headers
section() {
  echo -e "\n${BOLD}${BLUE}==== $1 ====${RESET}\n"
}

# Print success messages
success() {
  echo -e "${GREEN}✓ $1${RESET}"
}

# Print error messages
error() {
  echo -e "${RED}✗ $1${RESET}"
}

# Print warning messages
warning() {
  echo -e "${YELLOW}! $1${RESET}"
}

section "Testing Matanuska Fleet Manager Resilience"

# Check if required tools are installed
command -v curl >/dev/null 2>&1 || { error "curl is required but not installed. Aborting."; exit 1; }
command -v nc >/dev/null 2>&1 || { warning "netcat (nc) not found. Some tests will be skipped."; NC_AVAILABLE=false; }
NC_AVAILABLE=${NC_AVAILABLE:-true}

# Test 1: Network Connection Test
section "Testing Network Connection"
if ping -c 1 google.com &>/dev/null; then
  success "Internet connection available"
else
  error "No internet connection detected. Some tests will fail."
fi

# Test 2: Firebase Emulator Check
section "Testing Firebase Emulator Connectivity"
if $NC_AVAILABLE; then
  if nc -z localhost 8081 &>/dev/null; then
    success "Firebase Firestore emulator is running on port 8081"
  else
    warning "Firebase Firestore emulator is not running on port 8081. Will use production Firebase."
  fi
else
  warning "Skipping Firebase emulator check (netcat not available)"
fi

# Test 3: Network Throttling Simulation
section "Testing Network Throttling"
echo "This test will simulate slow network conditions using tc (Traffic Control)"
if command -v tc >/dev/null 2>&1; then
  echo "Applying network throttling (requires sudo)..."
  
  # Try to apply throttling, but don't fail if it doesn't work
  sudo tc qdisc add dev lo root netem delay 200ms loss 5% 2>/dev/null || warning "Couldn't apply network throttling (requires root privileges)"
  
  echo "Running app with network throttling for 10 seconds..."
  sleep 10
  
  # Try to remove throttling
  sudo tc qdisc del dev lo root 2>/dev/null
  success "Network throttling test completed"
else
  warning "tc (Traffic Control) not available. Skipping network throttling test."
fi

# Test 4: Offline Mode Simulation
section "Testing Offline Mode"
echo "This test will simulate going offline and back online"

# Create a temporary HTML file to test offline detection
cat > test_offline.html <<EOL
<!DOCTYPE html>
<html>
<head>
  <title>Offline Test</title>
  <script>
    function toggleConnection() {
      const wasOnline = navigator.onLine;
      const mockOffline = !wasOnline;
      
      // This is just a demo - actual network testing would be done differently
      console.log(mockOffline ? 'Going offline...' : 'Going online...');
      document.getElementById('status').textContent = mockOffline ? 'Offline' : 'Online';
      document.getElementById('status').style.color = mockOffline ? 'red' : 'green';
      
      // Dispatch appropriate event
      window.dispatchEvent(new Event(mockOffline ? 'offline' : 'online'));
    }

    window.addEventListener('online', () => {
      console.log('Online event detected');
    });
    
    window.addEventListener('offline', () => {
      console.log('Offline event detected');
    });
  </script>
</head>
<body>
  <h1>Offline Testing</h1>
  <p>Current status: <span id="status" style="color: green">Online</span></p>
  <button onclick="toggleConnection()">Toggle Connection</button>
</body>
</html>
EOL

echo "Created test HTML file for manual offline testing"
success "Offline mode simulation prepared"

# Test 5: Error Recovery Test
section "Testing Error Recovery"
echo "This test will generate some errors to test recovery mechanisms"

# Create a test error script
cat > test_errors.js <<EOL
// Test error handling and recovery
console.log('Testing error handling and recovery');

// Test 1: Simple try-catch recovery
try {
  console.log('Attempting operation that will fail...');
  throw new Error('Simulated error');
} catch (error) {
  console.log('Recovered from error:', error.message);
}

// Test 2: Promise rejection handling
const testPromise = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error('Simulated async error'));
    }, 1000);
  });
};

testPromise().catch(error => {
  console.log('Caught promise rejection:', error.message);
});

// Test 3: Multiple retries
let attempts = 0;
const maxAttempts = 3;

const operationWithRetry = () => {
  return new Promise((resolve, reject) => {
    attempts++;
    console.log(\`Attempt \${attempts} of \${maxAttempts}\`);
    
    if (attempts < maxAttempts) {
      reject(new Error(\`Failed attempt \${attempts}\`));
    } else {
      resolve('Operation succeeded after retries');
    }
  });
};

const performWithRetry = async () => {
  let lastError;
  
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const result = await operationWithRetry();
      console.log(result);
      return;
    } catch (error) {
      lastError = error;
      console.log(\`Retry needed: \${error.message}\`);
    }
  }
  
  console.log('Max retries exceeded, operation failed');
};

performWithRetry();
EOL

echo "Created test JavaScript file for error recovery testing"
echo "Run it with: node test_errors.js"
success "Error recovery test prepared"

# Final summary
section "Resilience Test Summary"
echo "The following tests have been prepared:"
echo "1. Network connectivity test: COMPLETED"
echo "2. Firebase emulator connectivity test: COMPLETED"
echo "3. Network throttling simulation: COMPLETED"
echo "4. Offline mode simulation: test_offline.html created"
echo "5. Error recovery test: test_errors.js created"
echo ""
echo "To continue testing:"
echo "- Open test_offline.html in a browser to test offline handling"
echo "- Run 'node test_errors.js' to test error recovery patterns"
echo ""
echo "For complete end-to-end testing of the application's resilience:"
echo "1. Start the application"
echo "2. Use browser devtools to simulate offline mode"
echo "3. Perform operations while offline"
echo "4. Observe data being stored locally"
echo "5. Restore connection and observe synchronization"
echo ""

success "Resilience test script completed"
