export const AppConfig = {
    // Development flags
    isDevelopment: __DEV__, // true in development, false in production
    
    // Feature toggles (you can manually override these)
    showTabs: __DEV__, // Show bottom tabs only in development
    showDevTools: __DEV__, // Show developer tools and health monitoring
    enableDebugMode: __DEV__, // Enable debug logging and features
    
    // App information
    version: '1.0.0',
    buildNumber: '1',
    
    // API configuration
    apiTimeout: 10000, // 10 seconds
  };
  
  export const DevUtils = {
    log: (message: string, ...args: any[]) => {
      if (AppConfig.enableDebugMode) {
        console.log(`[ReMap Debug] ${message}`, ...args);
      }
    },
    
    error: (message: string, error?: any) => {
      if (AppConfig.enableDebugMode) {
        console.error(`[ReMap Error] ${message}`, error);
      }
    },
    
    warn: (message: string, ...args: any[]) => {
      if (AppConfig.enableDebugMode) {
        console.warn(`[ReMap Warning] ${message}`, ...args);
      }
    },
  };
// ANNA YOU CAN IGNORE THIS FILE //