// =============================================
// ChronoVault - API Client
// =============================================

const API_BASE = 'api';

const api = {
    /**
     * Requête JSON générique
     */
    async request(endpoint, options = {}) {
        const url = `${API_BASE}/${endpoint}`;
        const config = {
            credentials: 'include',
            ...options,
        };

        if (options.body && !(options.body instanceof FormData)) {
            config.headers = { 'Content-Type': 'application/json', ...config.headers };
            config.body = JSON.stringify(options.body);
        }

        try {
            const res = await fetch(url, config);
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.error || 'Erreur inconnue');
            }
            return data;
        } catch (err) {
            if (err.message === 'Non authentifié. Veuillez vous connecter.') {
                app.currentUser = null;
                app.navigate('login');
            }
            throw err;
        }
    },

    // ── Auth ─────────────────────────────────
    auth: {
        register(username, email, password) {
            return api.request('auth.php?action=register', {
                method: 'POST',
                body: { username, email, password }
            });
        },
        login(login, password) {
            return api.request('auth.php?action=login', {
                method: 'POST',
                body: { login, password }
            });
        },
        logout() {
            return api.request('auth.php?action=logout');
        },
        me() {
            return api.request('auth.php?action=me');
        }
    },

    // ── Capsules ─────────────────────────────
    capsules: {
        list() {
            return api.request('capsules/index.php?action=list');
        },
        detail(id) {
            return api.request(`capsules/index.php?action=detail&id=${id}`);
        },
        create(title, description, opening_date) {
            return api.request('capsules/index.php?action=create', {
                method: 'POST',
                body: { title, description, opening_date }
            });
        },
        delete(capsule_id) {
            return api.request('capsules/index.php?action=delete', {
                method: 'POST',
                body: { capsule_id }
            });
        }
    },

    // ── Invitations ──────────────────────────
    invitations: {
        list() {
            return api.request('invitations/index.php?action=list');
        },
        send(capsule_id, username) {
            return api.request('invitations/index.php?action=send', {
                method: 'POST',
                body: { capsule_id, username }
            });
        },
        accept(invitation_id) {
            return api.request('invitations/index.php?action=accept', {
                method: 'POST',
                body: { invitation_id }
            });
        },
        decline(invitation_id) {
            return api.request('invitations/index.php?action=decline', {
                method: 'POST',
                body: { invitation_id }
            });
        }
    },

    // ── Memories ─────────────────────────────
    memories: {
        add(capsule_id, text_content, imageFile) {
            const formData = new FormData();
            formData.append('capsule_id', capsule_id);
            if (text_content) formData.append('text_content', text_content);
            if (imageFile) formData.append('image', imageFile);

            return api.request('memories/index.php?action=add', {
                method: 'POST',
                body: formData
            });
        },
        delete(memory_id) {
            return api.request('memories/index.php?action=delete', {
                method: 'POST',
                body: { memory_id }
            });
        }
    }
};
