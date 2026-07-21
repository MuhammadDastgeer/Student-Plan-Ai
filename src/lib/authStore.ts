import { useState, useEffect } from "react";

export interface UserProfile {
  name: string;
  email: string;
  id: string;
}

// Global active listeners to trigger re-renders upon login/logout state change
let listeners: Array<() => void> = [];

export const authStore = {
  getCurrentUser(): UserProfile | null {
    const userStr = localStorage.getItem("flowbase_current_user");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  setCurrentUser(user: UserProfile | null) {
    if (user) {
      localStorage.setItem("flowbase_current_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("flowbase_current_user");
    }
    listeners.forEach((l) => l());
  },

  getRegisteredUsers(): Record<string, { profile: UserProfile; hash: string }> {
    const usersStr = localStorage.getItem("flowbase_registered_users");
    if (!usersStr) return {};
    try {
      return JSON.parse(usersStr);
    } catch {
      return {};
    }
  },

  registerUser(name: string, email: string, passwordHash: string): { success: boolean; error?: string } {
    const users = this.getRegisteredUsers();
    const normalizedEmail = email.trim().toLowerCase();
    
    if (users[normalizedEmail]) {
      return { success: false, error: "An account with this email already exists." };
    }

    const newUser: UserProfile = {
      name: name.trim(),
      email: normalizedEmail,
      id: "usr-" + Date.now()
    };

    users[normalizedEmail] = {
      profile: newUser,
      hash: passwordHash
    };

    localStorage.setItem("flowbase_registered_users", JSON.stringify(users));
    
    // Automatically log in the newly registered user
    this.setCurrentUser(newUser);
    return { success: true };
  },

  resetPassword(email: string, passwordHash: string): { success: boolean; error?: string } {
    const users = this.getRegisteredUsers();
    const normalizedEmail = email.trim().toLowerCase();
    
    if (!users[normalizedEmail]) {
      return { success: false, error: "An account with this email address does not exist." };
    }

    users[normalizedEmail].hash = passwordHash;
    localStorage.setItem("flowbase_registered_users", JSON.stringify(users));
    return { success: true };
  },

  loginUser(email: string, passwordHash: string): { success: boolean; error?: string } {
    const users = this.getRegisteredUsers();
    const normalizedEmail = email.trim().toLowerCase();
    
    const user = users[normalizedEmail];
    if (!user || user.hash !== passwordHash) {
      return { success: false, error: "Invalid email or password combination." };
    }

    this.setCurrentUser(user.profile);
    return { success: true };
  },

  logoutUser() {
    this.setCurrentUser(null);
  },

  subscribe(listener: () => void) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },

  // Helper function to get isolated localStorage key for the current user
  getIsolatedKey(originalKey: string): string {
    const user = this.getCurrentUser();
    if (!user) {
      return originalKey;
    }
    // Prefix key with email to completely isolate data per user
    return `flowbase_user_${user.email}_${originalKey}`;
  }
};

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => authStore.getCurrentUser());

  useEffect(() => {
    const unsubscribe = authStore.subscribe(() => {
      setCurrentUser(authStore.getCurrentUser());
    });
    return unsubscribe;
  }, []);

  return {
    currentUser,
    isLoggedIn: !!currentUser,
    logout: () => authStore.logoutUser(),
    getIsolatedKey: (key: string) => authStore.getIsolatedKey(key)
  };
}
