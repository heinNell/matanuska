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
    console.log(`Attempt ${attempts} of ${maxAttempts}`);
    
    if (attempts < maxAttempts) {
      reject(new Error(`Failed attempt ${attempts}`));
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
      console.log(`Retry needed: ${error.message}`);
    }
  }
  
  console.log('Max retries exceeded, operation failed');
};

performWithRetry();
