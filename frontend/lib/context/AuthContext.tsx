'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User, LoginCredentials, RegisterData, AuthState } from '@/types/user';
import { apiService } from '@/lib/api/apiService';

interface AuthContextType extends AuthState {
    login: (credentials: LoginCredentials) => Promise<void>;
    loginWithGoogle: (credential: string) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const [state, setState] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
        isLoading: true,
    });

    // Initialize auth state from localStorage
    useEffect(() => {
        const initAuth = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const userStr = localStorage.getItem('user');

                if (token && userStr) {
                    const user = JSON.parse(userStr);

                    // Verify token is still valid by fetching current user
                    try {
                        const currentUser = await apiService.getCurrentUser();
                        setState({
                            user: currentUser,
                            isAuthenticated: true,
                            isLoading: false,
                        });
                    } catch (error) {
                        // Token expired, try to refresh
                        try {
                            await apiService.refreshToken();
                            const currentUser = await apiService.getCurrentUser();
                            setState({
                                user: currentUser,
                                isAuthenticated: true,
                                isLoading: false,
                            });
                        } catch (refreshError) {
                            // Refresh failed, clear auth
                            localStorage.removeItem('access_token');
                            localStorage.removeItem('refresh_token');
                            localStorage.removeItem('user');
                            setState({
                                user: null,
                                isAuthenticated: false,
                                isLoading: false,
                            });
                        }
                    }
                } else {
                    setState({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                    });
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                setState({
                    user: null,
                    isAuthenticated: false,
                    isLoading: false,
                });
            }
        };

        initAuth();
    }, []);

    const login = async (credentials: LoginCredentials) => {
        try {
            const { user, access, refresh } = await apiService.login(credentials);

            setState({
                user,
                isAuthenticated: true,
                isLoading: false,
            });

            router.push('/dashboard');
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const loginWithGoogle = async (credential: string) => {
        try {
            const { user, access, refresh, created } = await apiService.googleAuth(credential);

            setState({
                user,
                isAuthenticated: true,
                isLoading: false,
            });

            // New users go to onboarding, existing users go to dashboard
            router.push(created ? '/onboarding' : '/dashboard');
        } catch (error) {
            console.error('Google login error:', error);
            throw error;
        }
    };

    const register = async (data: RegisterData) => {
        try {
            const { user, access, refresh } = await apiService.register(data);

            setState({
                user,
                isAuthenticated: true,
                isLoading: false,
            });

            router.push('/onboarding');
        } catch (error) {
            console.error('Register error:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await apiService.logout();

            setState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
            });

            router.push('/');
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    };

    const updateUser = (user: User) => {
        setState(prev => ({
            ...prev,
            user,
        }));
        localStorage.setItem('user', JSON.stringify(user));
    };

    return (
        <AuthContext.Provider
            value={{
                ...state,
                login,
                loginWithGoogle,
                register,
                logout,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
