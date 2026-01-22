/**
 * Global error handler to catch and log errors from device
 * This ensures all errors appear in the terminal
 */

// Set up global error handlers before app starts
if (typeof global !== 'undefined') {
  // Handle unhandled promise rejections
  const originalUnhandledRejection = global.onunhandledrejection;
  if (typeof global.onunhandledrejection !== 'undefined') {
    global.onunhandledrejection = (event) => {
      console.error('═══════════════════════════════════════');
      console.error('🚨 UNHANDLED PROMISE REJECTION:');
      console.error('Reason:', event.reason);
      if (event.reason && event.reason.stack) {
        console.error('Stack:', event.reason.stack);
      }
      console.error('═══════════════════════════════════════');
      
      if (originalUnhandledRejection) {
        originalUnhandledRejection(event);
      }
    };
  }

  // Handle React Native errors via ErrorUtils
  if (typeof ErrorUtils !== 'undefined') {
    const originalHandler = ErrorUtils.getGlobalHandler();
    ErrorUtils.setGlobalHandler((error, isFatal) => {
      console.error('═══════════════════════════════════════');
      console.error('🚨 GLOBAL ERROR HANDLER:');
      console.error('Error:', error);
      console.error('Is Fatal:', isFatal);
      if (error && error.stack) {
        console.error('Stack:', error.stack);
      }
      console.error('═══════════════════════════════════════');
      
      if (originalHandler) {
        originalHandler(error, isFatal);
      }
    });
  }
}

// Enhanced console methods with better formatting
const originalError = console.error;
console.error = (...args) => {
  originalError('═══════════════════════════════════════');
  originalError('🚨 ERROR FROM DEVICE:');
  originalError(...args);
  originalError('═══════════════════════════════════════');
};

export default {};
