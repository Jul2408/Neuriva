import { toast } from 'sonner';

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
    email: string;
    password: string;
}

export interface RegisterData {
    username?: string;
    email: string;
    password: string;
    name?: string;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
}

export interface ChatConversation {
    id: string;
    title: string;
    created_at: string;
    updated_at: string;
    last_message?: { role: string; content: string; timestamp: string } | null;
    message_count?: number;
    messages?: ChatMessage[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

/**
 * Extrait un message d'erreur lisible depuis les réponses DRF.
 * DRF peut renvoyer: { detail: "..." } ou { field: ["msg1", "msg2"] }
 */
function extractApiError(errorBody: any, fallback: string): string {
    if (!errorBody) return fallback;
    if (typeof errorBody === 'string') return errorBody;
    if (errorBody.detail) return errorBody.detail;
    const fieldErrors = Object.entries(errorBody)
        .filter(([, v]) => Array.isArray(v))
        .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(', ')}`)
        .join('\n');
    if (fieldErrors) return fieldErrors;
    if (Array.isArray(errorBody.non_field_errors)) {
        return errorBody.non_field_errors.join('\n');
    }
    return fallback;
}

function notifyError(errorBody: any, fallback: string) {
    const message = extractApiError(errorBody, fallback);
    toast.error(message);
    return message;
}

class ApiService {
    private getHeaders(includeAuth: boolean = false, isMultipart: boolean = false): HeadersInit {
        const headers: any = { 'Content-Type': 'application/json' };
        if (isMultipart) delete headers['Content-Type'];
        if (includeAuth) {
            const token = this.getToken();
            if (token) headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    }

    private async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
        let response = await fetch(url, options);
        if (response.status === 401) {
            try {
                await this.refreshToken();
                const headers = options.headers as any;
                if (headers?.['Authorization']) {
                    headers['Authorization'] = `Bearer ${this.getToken()}`;
                }
                response = await fetch(url, options);
            } catch {
                this.clearTokens();
                throw new Error('Session expirée. Veuillez vous reconnecter.');
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

    clearTokens(): void {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
    }

    // ─── Auth ─────────────────────────────────────────────────────────────────

    async login(credentials: LoginCredentials): Promise<{ user: User; access: string; refresh: string }> {
        const response = await fetch(`${API_URL}/auth/login/`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ username: credentials.email, password: credentials.password }),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(notifyError(error, 'Identifiants incorrects'));
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
            throw new Error(notifyError(error, 'Échec de la connexion avec Google'));
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
            throw new Error(notifyError(error, "Échec de l'inscription"));
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
        const response = await this.fetchWithAuth(`${API_URL}/auth/me/`, {
            method: 'PATCH',
            headers: this.getHeaders(true),
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(notifyError(error, 'Impossible de mettre à jour le profil'));
        }
        return response.json();
    }

    async deleteAccount(): Promise<void> {
        const response = await this.fetchWithAuth(`${API_URL}/auth/me/`, {
            method: 'DELETE',
            headers: this.getHeaders(true),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(notifyError(error, 'Impossible de supprimer le compte'));
        }
        this.clearTokens();
    }

    async updateProfileMultipart(formData: FormData): Promise<User> {
        const response = await this.fetchWithAuth(`${API_URL}/auth/me/`, {
            method: 'PATCH',
            headers: this.getHeaders(true, true),
            body: formData,
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(notifyError(error, 'Impossible de mettre à jour le profil'));
        }
        return response.json();
    }

    async changePassword(oldPassword: string, newPassword: string): Promise<void> {
        const response = await this.fetchWithAuth(`${API_URL}/auth/change-password/`, {
            method: 'PUT',
            headers: this.getHeaders(true),
            body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(notifyError(error, 'Échec du changement de mot de passe'));
        }
    }

    async resetPassword(email: string): Promise<void> {
        const response = await fetch(`${API_URL}/auth/reset-password/`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ email }),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(notifyError(error, 'Échec de la réinitialisation'));
        }
    }

    async exportData(): Promise<Blob> {
        const response = await this.fetchWithAuth(`${API_URL}/auth/export/`, {
            headers: this.getHeaders(true),
        });
        if (!response.ok) throw new Error('Failed to export data');
        return response.blob();
    }

    // ─── Tasks ────────────────────────────────────────────────────────────────

    async getTasks() {
        const response = await this.fetchWithAuth(`${API_URL}/tasks/`, {
            headers: this.getHeaders(true),
        });
        if (!response.ok) throw new Error('Failed to fetch tasks');
        return response.json();
    }

    async createTask(taskData: any) {
        const response = await this.fetchWithAuth(`${API_URL}/tasks/`, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify(taskData),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(notifyError(error, 'Impossible de créer la tâche'));
        }
        return response.json();
    }

    async updateTask(taskId: string, taskData: any) {
        const response = await this.fetchWithAuth(`${API_URL}/tasks/${taskId}/`, {
            method: 'PATCH',
            headers: this.getHeaders(true),
            body: JSON.stringify(taskData),
        });
        if (!response.ok) throw new Error('Failed to update task');
        return response.json();
    }

    async deleteTask(taskId: string) {
        const response = await this.fetchWithAuth(`${API_URL}/tasks/${taskId}/`, {
            method: 'DELETE',
            headers: this.getHeaders(true),
        });
        if (!response.ok) throw new Error('Failed to delete task');
    }

    // ─── Notifications ────────────────────────────────────────────────────────

    async getNotifications() {
        const response = await this.fetchWithAuth(`${API_URL}/notifications/`, {
            headers: this.getHeaders(true),
        });
        if (!response.ok) return [];
        const data = await response.json();
        return data.results || data;
    }

    async updateNotification(id: string, data: any) {
        const response = await this.fetchWithAuth(`${API_URL}/notifications/${id}/`, {
            method: 'PATCH',
            headers: this.getHeaders(true),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update notification');
        return response.json();
    }

    // ─── Dashboard ────────────────────────────────────────────────────────────

    async getDashboardData() {
        const response = await this.fetchWithAuth(`${API_URL}/dashboard/`, {
            headers: this.getHeaders(true),
        });
        if (!response.ok) throw new Error('Failed to fetch dashboard data');
        return response.json();
    }

    // ─── AI Chat (persistant) ─────────────────────────────────────────────────

    async sendAIMessage(
        message: string,
        conversationId?: string | null,
        conversationHistory?: { role: string; content: string }[]
    ): Promise<{ message: string; timestamp: string; conversation_id: string }> {
        const response = await this.fetchWithAuth(`${API_URL}/ai/chat/`, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify({
                message,
                conversation_id: conversationId || null,
                conversation_history: conversationHistory || [],
            }),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(notifyError(error, "Impossible de contacter l'IA"));
        }
        return response.json();
    }

    // ─── Conversations ────────────────────────────────────────────────────────

    async getConversations(): Promise<ChatConversation[]> {
        const response = await this.fetchWithAuth(`${API_URL}/conversations/`, {
            headers: this.getHeaders(true),
        });
        if (!response.ok) return [];
        const data = await response.json();
        return data.results || data;
    }

    async getConversation(id: string): Promise<ChatConversation> {
        const response = await this.fetchWithAuth(`${API_URL}/conversations/${id}/`, {
            headers: this.getHeaders(true),
        });
        if (!response.ok) throw new Error('Failed to fetch conversation');
        return response.json();
    }

    async createConversation(title: string = 'Nouvelle conversation'): Promise<ChatConversation> {
        const response = await this.fetchWithAuth(`${API_URL}/conversations/`, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify({ title }),
        });
        if (!response.ok) throw new Error('Failed to create conversation');
        return response.json();
    }

    async renameConversation(id: string, title: string): Promise<void> {
        await this.fetchWithAuth(`${API_URL}/conversations/${id}/rename/`, {
            method: 'PATCH',
            headers: this.getHeaders(true),
            body: JSON.stringify({ title }),
        });
    }

    async deleteConversation(id: string): Promise<void> {
        const response = await this.fetchWithAuth(`${API_URL}/conversations/${id}/`, {
            method: 'DELETE',
            headers: this.getHeaders(true),
        });
        if (!response.ok) throw new Error('Failed to delete conversation');
    }
}

export const apiService = new ApiService();
