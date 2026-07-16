export interface User {
    id: string;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
    avatar?: string;
    timezone?: string;
    notification_level?: string;
    ai_tone?: 'robot' | 'coach' | 'zen';
    is_premium?: boolean;
    created_at?: string;
    // Computed or extra fields
    preferences?: UserPreferences;
    stats?: UserStats;
}

export interface UserPreferences {
    aiTone: 'robot' | 'coach' | 'zen';
    notificationLevel: 'minimal' | 'normal' | 'maximum';
    timezone: string;
    theme: 'light' | 'dark' | 'auto';
}

export interface UserStats {
    totalTasks: number;
    completedTasks: number;
    focusHours: number;
    currentStreak: number;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
}
