// Utility function to clear all authentication-related storage
export const clearAllAuthStorage = () => {
  try {
    // Clear localStorage
    const localStorageKeys = Object.keys(localStorage);
    localStorageKeys.forEach(key => {
      if (key.includes('supabase') || key.includes('auth') || key.includes('session') || key.includes('user')) {
        localStorage.removeItem(key);
      }
    });

    // Clear sessionStorage
    const sessionStorageKeys = Object.keys(sessionStorage);
    sessionStorageKeys.forEach(key => {
      if (key.includes('supabase') || key.includes('auth') || key.includes('session') || key.includes('user')) {
        sessionStorage.removeItem(key);
      }
    });

    // Clear all cookies (simple approach)
    document.cookie.split(";").forEach(cookie => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      if (name.trim().includes('supabase') || name.trim().includes('auth') || name.trim().includes('session')) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      }
    });

    console.log('All authentication storage cleared');
  } catch (error) {
    console.error('Error clearing auth storage:', error);
  }
};

// Clear all storage (nuclear option)
export const clearAllStorage = () => {
  try {
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear all cookies
    document.cookie.split(";").forEach(cookie => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
    
    console.log('All browser storage cleared');
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
};
