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
            const token = localStorage.getItem('access_token');
            const refreshToken = localStorage.getItem('refresh_token');
            const userStr = localStorage.getItem('user');

            // Pas de token du tout → vraiment déconnecté
            if (!token && !refreshToken) {
                setState({ user: null, isAuthenticated: false, isLoading: false });
                return;
            }

            // On a un token : charger l'utilisateur en cache immédiatement
            // L'utilisateur voit son compte sans attendre le réseau
            if (userStr) {
                setState({ user: JSON.parse(userStr), isAuthenticated: true, isLoading: false });
            }

            // Vérification réseau silencieuse en arrière-plan
            // On ne déconnecte JAMAIS sur une simple erreur réseau
            try {
                const currentUser = await apiService.getCurrentUser();
                setState({ user: currentUser, isAuthenticated: true, isLoading: false });
            } catch (error: any) {
                const isNetworkError = error instanceof TypeError || error?.message?.includes('fetch');
                const is401 = error?.message?.includes('401') || error?.message?.includes('Session expirée');

                if (isNetworkError) {
                    // Pas de réseau → on garde la session locale intacte
                    console.info('[Auth] Pas de réseau, session locale maintenue.');
                    return;
                }

                if (is401) {
                    // Token expiré → essayer de rafraîchir
                    try {
                        await apiService.refreshToken();
                        const currentUser = await apiService.getCurrentUser();
                        setState({ user: currentUser, isAuthenticated: true, isLoading: false });
                    } catch (refreshError: any) {
                        const isRefreshNetworkError = refreshError instanceof TypeError;
                        if (isRefreshNetworkError) {
                            // Toujours pas de réseau, on maintient la session
                            return;
                        }
                        // Vraie erreur d'auth → déconnecter proprement
                        apiService.clearTokens();
                        setState({ user: null, isAuthenticated: false, isLoading: false });
                    }
                }
                // Toute autre erreur non-401 : on garde la session
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
