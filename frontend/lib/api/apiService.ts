// Types
export interface User {
    id: string;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
    avatar?: string;
    ai_tone?: 'robot' | 'coach' | 'zen';
    is_premium?: boolean;
    created_at?: string;
    [key: string]: any;
}

export interface LoginCredentials {
    email: string; // Changed from username to email as per usages
    password: string;
}

export interface RegisterData {
    username?: string;
    email: string;
    password: string;
    name?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

class ApiService {
    private getHeaders(includeAuth: boolean = false, isMultipart: boolean = false): HeadersInit {
        const headers: any = {
            'Content-Type': 'application/json',
        };

        if (isMultipart) {
            delete headers['Content-Type']; // Let browser set boundary
        }

        if (includeAuth) {
            const token = this.getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    }

    private async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
        let response = await fetch(url, options);

        // If unauthorized, try to refresh token and retry once
        if (response.status === 401) {
            try {
                await this.refreshToken();
                // Update headers with new token
                const headers = options.headers as any;
                if (headers && headers['Authorization']) {
                    const newToken = this.getToken();
                    headers['Authorization'] = `Bearer ${newToken}`;
                }
                response = await fetch(url, options);
            } catch (error) {
                // Refresh failed, clear tokens and throw
                this.clearTokens();
                throw new Error('Session expired. Please login again.');
            }
        }

        return response;
    }

    private getToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('access_token');
    }

    private setTokens(accessToken: string, refreshToken: string): void {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
    }

    private clearTokens(): void {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
    }

    // Auth endpoints
    async login(credentials: LoginCredentials): Promise<{ user: User; access: string; refresh: string }> {
        const response = await fetch(`${API_URL}/auth/login/`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({
                username: credentials.email,
                password: credentials.password
            }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.detail || 'Échec de la connexion');
        }

        const data = await response.json();
        this.setTokens(data.access, data.refresh);
        localStorage.setItem('user', JSON.stringify(data.user));

        return data;
    }

    async googleAuth(credential: string): Promise<{ user: User; access: string; refresh: string; created: boolean }> {
        const response = await fetch(`${API_URL}/auth/google/`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ credential }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.detail || 'Échec de la connexion avec Google');
        }

        const data = await response.json();
        this.setTokens(data.access, data.refresh);
        localStorage.setItem('user', JSON.stringify(data.user));

        return data;
    }

    async register(data: RegisterData): Promise<{ user: User; access: string; refresh: string }> {
        const response = await fetch(`${API_URL}/auth/register/`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.detail || 'Échec de l\'inscription');
        }

        const responseData = await response.json();
        this.setTokens(responseData.access, responseData.refresh);
        localStorage.setItem('user', JSON.stringify(responseData.user));

        return responseData;
    }

    async logout(): Promise<void> {
        try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
                await fetch(`${API_URL}/auth/logout/`, {
                    method: 'POST',
                    headers: this.getHeaders(true),
                    body: JSON.stringify({ refresh: refreshToken }),
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.clearTokens();
        }
    }

    async refreshToken(): Promise<string> {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');

        const response = await fetch(`${API_URL}/auth/refresh/`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ refresh: refreshToken }),
        });

        if (!response.ok) {
            this.clearTokens();
            throw new Error('Token refresh failed');
        }

        const data = await response.json();
        localStorage.setItem('access_token', data.access);
        return data.access;
    }

    async getCurrentUser(): Promise<User> {
        const response = await this.fetchWithAuth(`${API_URL}/auth/me/`, {
            headers: this.getHeaders(true),
        });

        if (!response.ok) throw new Error('Failed to fetch user');

        const user = await response.json();
        localStorage.setItem('user', JSON.stringify(user));
        return user;
    }

    async updateUser(data: Partial<any>): Promise<User> {
        const response = await fetch(`${API_URL}/auth/me/`, {
            method: 'PATCH',
            headers: this.getHeaders(true),
            body: JSON.stringify(data),
        });

        if (!response.ok) throw new Error('Failed to update user');
        return response.json();
    }

    async deleteAccount(): Promise<void> {
        const response = await fetch(`${API_URL}/auth/me/`, {
            method: 'DELETE',
            headers: this.getHeaders(true),
        });

        if (!response.ok) throw new Error('Failed to delete account');
        this.clearTokens();
    }

    async updateProfileMultipart(formData: FormData): Promise<User> {
        const response = await fetch(`${API_URL}/auth/me/`, {
            method: 'PATCH',
            headers: this.getHeaders(true, true), // isMultipart = true
            body: formData,
        });

        if (!response.ok) throw new Error('Failed to update profile');
        return response.json();
    }

    async changePassword(oldPassword: string, newPassword: string): Promise<void> {
        const response = await fetch(`${API_URL}/auth/change-password/`, {
            method: 'PUT', // or PATCH/POST depending on view but UpdateAPIView uses PUT/PATCH
            headers: this.getHeaders(true),
            body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Échec du changement de mot de passe');
        }
    }

    async resetPassword(email: string): Promise<void> {
        const response = await fetch(`${API_URL}/auth/reset-password/`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ email }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Échec de la réinitialisation');
        }
    }

    async exportData(): Promise<Blob> {
        const response = await fetch(`${API_URL}/auth/export/`, {
            headers: this.getHeaders(true),
        });

        if (!response.ok) throw new Error('Failed to export data');
        return response.blob();
    }

    // Tasks endpoints
    async getTasks() {
        const response = await fetch(`${API_URL}/tasks/`, {
            headers: this.getHeaders(true),
        });
        if (!response.ok) throw new Error('Failed to fetch tasks');
        return response.json();
    }

    async createTask(taskData: any) {
        const response = await fetch(`${API_URL}/tasks/`, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify(taskData),
        });
        if (!response.ok) throw new Error('Failed to create task');
        return response.json();
    }

    async updateTask(taskId: string, taskData: any) {
        const response = await fetch(`${API_URL}/tasks/${taskId}/`, {
            method: 'PATCH',
            headers: this.getHeaders(true),
            body: JSON.stringify(taskData),
        });
        if (!response.ok) throw new Error('Failed to update task');
        return response.json();
    }

    async deleteTask(taskId: string) {
        const response = await fetch(`${API_URL}/tasks/${taskId}/`, {
            method: 'DELETE',
            headers: this.getHeaders(true),
        });
        if (!response.ok) throw new Error('Failed to delete task');
    }

    // Notifications
    async getNotifications() {
        const response = await fetch(`${API_URL}/notifications/`, {
            headers: this.getHeaders(true),
        });
        if (!response.ok) return [];
        const data = await response.json();
        return data.results || data;
    }

    async updateNotification(id: string, data: any) {
        const response = await fetch(`${API_URL}/notifications/${id}/`, {
            method: 'PATCH',
            headers: this.getHeaders(true),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update notification');
        return response.json();
    }

    async getDashboardData() {
        const response = await this.fetchWithAuth(`${API_URL}/dashboard/`, {
            headers: this.getHeaders(true),
        });
        if (!response.ok) throw new Error('Failed to fetch dashboard data');
        return response.json();
    }

    // AI Chat
    async sendAIMessage(message: string, conversationHistory?: any[]) {
        const response = await this.fetchWithAuth(`${API_URL}/ai/chat/`, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify({
                message,
                conversation_history: conversationHistory || []
            }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || 'Failed to send message');
        }

        return response.json();
    }
}

export const apiService = new ApiService();
