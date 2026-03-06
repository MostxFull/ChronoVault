// =============================================
// ChronoVault - Application principale (SPA)
// Design: Black / White / Nature Green
// Dark mode + Light mode
// =============================================

const app = {
    currentUser: null,
    currentPage: 'login',

    /** Initialise l'app */
    async init() {
        try {
            const data = await api.auth.me();
            this.currentUser = data.user;
            this.navigate('dashboard');
        } catch {
            this.navigate('login');
        }
    },

    /** Navigation entre les pages */
    navigate(page, params = {}) {
        this.currentPage = page;
        const main = document.getElementById('app');
        main.innerHTML = '';
        main.className = 'min-h-screen';

        switch (page) {
            case 'login':      this.renderLogin(main); break;
            case 'register':   this.renderRegister(main); break;
            case 'dashboard':  this.renderDashboard(main); break;
            case 'capsule':    this.renderCapsuleDetail(main, params.id); break;
            case 'create':     this.renderCreateCapsule(main); break;
            default:           this.renderLogin(main);
        }
    },

    // ── Theme toggle ─────────────────────────
    isDark() {
        return document.documentElement.classList.contains('dark');
    },

    toggleTheme() {
        const html = document.documentElement;
        html.classList.toggle('dark');
        localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
        // Update toggle icon
        document.querySelectorAll('.theme-icon-sun').forEach(el => el.classList.toggle('hidden', this.isDark()));
        document.querySelectorAll('.theme-icon-moon').forEach(el => el.classList.toggle('hidden', !this.isDark()));
    },

    /** Theme toggle button HTML */
    themeToggleBtn() {
        const sunHidden = this.isDark() ? 'hidden' : '';
        const moonHidden = this.isDark() ? '' : 'hidden';
        return `
        <button onclick="app.toggleTheme()" class="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 transition" title="Changer de thème">
            <svg class="w-5 h-5 theme-icon-sun ${sunHidden}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
            <svg class="w-5 h-5 theme-icon-moon ${moonHidden}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
            </svg>
        </button>`;
    },

    /** Toast notification */
    toast(message, type = 'success') {
        const toast = document.createElement('div');
        const colors = {
            success: 'bg-green-600 text-white',
            error: 'bg-red-600 text-white',
            info: 'bg-neutral-800 dark:bg-neutral-200 text-white dark:text-black'
        };
        toast.className = `fixed top-4 right-4 ${colors[type]} px-6 py-3 rounded-xl shadow-lg z-50 transition-all duration-500 text-sm font-medium`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('translate-x-full', 'opacity-0');
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    },

    // ─────────────────────────────────────────
    //  LOGIN
    // ─────────────────────────────────────────
    renderLogin(container) {
        container.innerHTML = `
        <div class="min-h-screen flex items-center justify-center p-4">
            <div class="w-full max-w-sm">
                <!-- Logo -->
                <div class="text-center mb-8">
                    <img src="logo.png" alt="ChronoVault" class="w-16 h-16 rounded-2xl mb-4 mx-auto">
                    <h1 class="text-3xl font-bold">ChronoVault</h1>
                    <p class="text-neutral-500 text-sm mt-1">Coffre-fort de souvenirs collaboratif</p>
                </div>

                <!-- Card -->
                <div class="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
                    <h2 class="text-xl font-semibold mb-5">Connexion</h2>
                    <form id="loginForm" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">Pseudo ou email</label>
                            <input type="text" name="login" required
                                class="w-full px-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                                placeholder="votre pseudo ou email">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">Mot de passe</label>
                            <input type="password" name="password" required
                                class="w-full px-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                                placeholder="••••••">
                        </div>
                        <button type="submit"
                            class="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition shadow-sm">
                            Se connecter
                        </button>
                    </form>
                    <p class="mt-5 text-center text-neutral-500 text-sm">
                        Pas de compte ?
                        <a href="#" id="goToRegister" class="text-green-600 dark:text-green-400 hover:underline font-medium">Inscription</a>
                    </p>
                </div>

                <!-- Theme toggle -->
                <div class="flex justify-center mt-6">
                    ${this.themeToggleBtn()}
                </div>
            </div>
        </div>`;

        document.getElementById('goToRegister').addEventListener('click', (e) => {
            e.preventDefault();
            this.navigate('register');
        });

        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            try {
                const data = await api.auth.login(form.login.value, form.password.value);
                this.currentUser = data.user;
                this.toast('Bienvenue ' + data.user.username + ' !');
                this.navigate('dashboard');
            } catch (err) {
                this.toast(err.message, 'error');
            }
        });
    },

    // ─────────────────────────────────────────
    //  REGISTER
    // ─────────────────────────────────────────
    renderRegister(container) {
        container.innerHTML = `
        <div class="min-h-screen flex items-center justify-center p-4">
            <div class="w-full max-w-sm">
                <div class="text-center mb-8">
                    <img src="logo.png" alt="ChronoVault" class="w-16 h-16 rounded-2xl mb-4 mx-auto">
                    <h1 class="text-3xl font-bold">ChronoVault</h1>
                    <p class="text-neutral-500 text-sm mt-1">Créez votre compte</p>
                </div>

                <div class="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
                    <h2 class="text-xl font-semibold mb-5">Inscription</h2>
                    <form id="registerForm" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">Pseudo</label>
                            <input type="text" name="username" required minlength="3"
                                class="w-full px-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                                placeholder="votre pseudo unique">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">Email</label>
                            <input type="email" name="email" required
                                class="w-full px-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                                placeholder="votre@email.com">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">Mot de passe</label>
                            <input type="password" name="password" required minlength="6"
                                class="w-full px-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                                placeholder="minimum 6 caractères">
                        </div>
                        <button type="submit"
                            class="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition shadow-sm">
                            Créer mon compte
                        </button>
                    </form>
                    <p class="mt-5 text-center text-neutral-500 text-sm">
                        Déjà inscrit ?
                        <a href="#" id="goToLogin" class="text-green-600 dark:text-green-400 hover:underline font-medium">Connexion</a>
                    </p>
                </div>

                <div class="flex justify-center mt-6">
                    ${this.themeToggleBtn()}
                </div>
            </div>
        </div>`;

        document.getElementById('goToLogin').addEventListener('click', (e) => {
            e.preventDefault();
            this.navigate('login');
        });

        document.getElementById('registerForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            try {
                const data = await api.auth.register(form.username.value, form.email.value, form.password.value);
                this.currentUser = data.user;
                this.toast('Compte créé ! Bienvenue ' + data.user.username);
                this.navigate('dashboard');
            } catch (err) {
                this.toast(err.message, 'error');
            }
        });
    },

    // ─────────────────────────────────────────
    //  DASHBOARD
    // ─────────────────────────────────────────
    async renderDashboard(container) {
        container.innerHTML = `
        <div class="min-h-screen">
            <!-- Navbar -->
            <nav class="sticky top-0 z-40 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-lg border-b border-neutral-200 dark:border-neutral-800">
                <div class="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
                    <div class="flex items-center gap-2.5">
                        <img src="logo.png" alt="ChronoVault" class="w-9 h-9 rounded-lg">
                        <span class="text-lg font-bold">ChronoVault</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <!-- Invitations -->
                        <button id="btnInvitations" class="relative p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition">
                            <svg class="w-5 h-5 text-neutral-600 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                            </svg>
                            <span id="invitationBadge" class="hidden absolute -top-0.5 -right-0.5 min-w-[22px] h-[18px] px-1.5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">0</span>
                        </button>
                        <!-- Theme -->
                        ${this.themeToggleBtn()}
                        <!-- User -->
                        <div class="flex items-center gap-2 pl-2 border-l border-neutral-200 dark:border-neutral-800 ml-1">
                            <div class="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-xs">
                                ${this.currentUser?.username?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <span class="hidden sm:block text-sm font-medium">${this.currentUser?.username || ''}</span>
                        </div>
                        <!-- Logout -->
                        <button id="btnLogout" class="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-red-500 transition">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </nav>

            <!-- Invitations Panel -->
            <div id="invitationsPanel" class="hidden fixed inset-0 z-50">
                <div class="absolute inset-0 bg-black/40" id="closeInvPanel"></div>
                <div class="absolute right-0 top-0 h-full w-full max-w-sm bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 p-6 overflow-y-auto shadow-xl">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-lg font-bold">Invitations</h3>
                        <button id="closeInvBtn" class="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>
                    <div id="invitationsList" class="space-y-3"></div>
                </div>
            </div>

            <!-- Main -->
            <div class="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                    <div>
                        <h2 class="text-2xl font-bold">Mes Capsules</h2>
                        <p class="text-neutral-500 mt-1 text-sm">Vos souvenirs scellés dans le temps</p>
                    </div>
                    <button id="btnCreateCapsule"
                        class="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition shadow-sm flex items-center gap-2 text-sm">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                        </svg>
                        Nouvelle capsule
                    </button>
                </div>

                <div id="capsulesList" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div class="col-span-full text-center py-16">
                        <div class="animate-pulse text-neutral-400">Chargement...</div>
                    </div>
                </div>
            </div>
        </div>`;

        // Events
        document.getElementById('btnLogout').addEventListener('click', async () => {
            await api.auth.logout();
            this.currentUser = null;
            this.toast('Déconnecté.', 'info');
            this.navigate('login');
        });

        document.getElementById('btnCreateCapsule').addEventListener('click', () => this.navigate('create'));

        const invPanel = document.getElementById('invitationsPanel');
        document.getElementById('btnInvitations').addEventListener('click', () => {
            invPanel.classList.toggle('hidden');
            this.loadInvitations();
        });
        document.getElementById('closeInvPanel').addEventListener('click', () => invPanel.classList.add('hidden'));
        document.getElementById('closeInvBtn').addEventListener('click', () => invPanel.classList.add('hidden'));

        await this.loadCapsules();
        await this.loadInvitationBadge();
    },

    // ── Capsule cards ────────────────────────
    async loadCapsules() {
        try {
            const data = await api.capsules.list();
            const list = document.getElementById('capsulesList');
            if (!list) return;

            if (data.capsules.length === 0) {
                list.innerHTML = `
                <div class="col-span-full text-center py-16">
                    <div class="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-neutral-100 dark:bg-neutral-800 mb-5">
                        <svg class="w-10 h-10 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                        </svg>
                    </div>
                    <h3 class="text-lg font-semibold mb-1">Aucune capsule</h3>
                    <p class="text-neutral-500 text-sm">Créez votre première capsule temporelle !</p>
                </div>`;
                return;
            }

            list.innerHTML = data.capsules.map(cap => {
                const isOpen = cap.is_opened == 1;
                const daysLeft = Math.ceil((new Date(cap.opening_date) - new Date()) / (1000 * 60 * 60 * 24));

                return `
                <div class="group cursor-pointer" onclick="app.navigate('capsule', {id: ${cap.id}})">
                    <div class="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 hover:border-green-400 dark:hover:border-green-600 transition-all duration-200 h-full">
                        <div class="flex items-start justify-between mb-3">
                            <div class="w-10 h-10 rounded-xl ${isOpen ? 'bg-green-100 dark:bg-green-900/30' : 'bg-neutral-200 dark:bg-neutral-800'} flex items-center justify-center">
                                ${isOpen
                                    ? '<svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"/></svg>'
                                    : '<svg class="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>'}
                            </div>
                            <span class="text-xs px-2.5 py-1 rounded-full font-medium ${isOpen ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'}">
                                ${isOpen ? 'Ouverte' : 'Scellée'}
                            </span>
                        </div>
                        <h3 class="text-base font-semibold mb-1.5 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">${this.escapeHtml(cap.title)}</h3>
                        <p class="text-neutral-500 text-sm mb-4 line-clamp-2">${this.escapeHtml(cap.description || 'Aucune description')}</p>
                        <div class="flex items-center justify-between text-xs text-neutral-400">
                            <span class="flex items-center gap-1">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                ${cap.member_count}
                            </span>
                            <span class="flex items-center gap-1">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                ${cap.memory_count}
                            </span>
                            <span class="flex items-center gap-1">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                ${isOpen ? 'Ouverte' : (daysLeft > 0 ? 'J-' + daysLeft : 'Bientôt')}
                            </span>
                        </div>
                    </div>
                </div>`;
            }).join('');
        } catch (err) {
            this.toast(err.message, 'error');
        }
    },

    async loadInvitationBadge() {
        try {
            const data = await api.invitations.list();
            const badge = document.getElementById('invitationBadge');
            if (!badge) return;
            if (data.invitations.length > 0) {
                badge.textContent = data.invitations.length;
                badge.classList.remove('hidden');
            }
        } catch {}
    },

    async loadInvitations() {
        try {
            const data = await api.invitations.list();
            const list = document.getElementById('invitationsList');
            if (!list) return;

            if (data.invitations.length === 0) {
                list.innerHTML = '<p class="text-neutral-500 text-center py-8 text-sm">Aucune invitation en attente.</p>';
                return;
            }

            list.innerHTML = data.invitations.map(inv => `
                <div class="bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-4">
                    <p class="font-semibold text-sm mb-1">${this.escapeHtml(inv.capsule_title)}</p>
                    <p class="text-neutral-500 text-xs mb-1">Invité par <span class="text-green-600 dark:text-green-400 font-medium">${this.escapeHtml(inv.invited_by_name)}</span></p>
                    <p class="text-neutral-400 text-xs mb-3">Ouverture : ${new Date(inv.opening_date).toLocaleDateString('fr-FR')}</p>
                    <div class="flex gap-2">
                        <button onclick="app.handleInvitation(${inv.id}, 'accept')"
                            class="flex-1 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-xs font-medium">
                            Accepter
                        </button>
                        <button onclick="app.handleInvitation(${inv.id}, 'decline')"
                            class="flex-1 py-1.5 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition text-xs font-medium">
                            Refuser
                        </button>
                    </div>
                </div>
            `).join('');
        } catch (err) {
            this.toast(err.message, 'error');
        }
    },

    async handleInvitation(id, action) {
        try {
            if (action === 'accept') {
                await api.invitations.accept(id);
                this.toast('Invitation acceptée !');
            } else {
                await api.invitations.decline(id);
                this.toast('Invitation refusée.', 'info');
            }
            await this.loadInvitations();
            await this.loadInvitationBadge();
            await this.loadCapsules();
        } catch (err) {
            this.toast(err.message, 'error');
        }
    },

    // ─────────────────────────────────────────
    //  CREATE CAPSULE
    // ─────────────────────────────────────────
    renderCreateCapsule(container) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const minDate = tomorrow.toISOString().split('T')[0];

        container.innerHTML = `
        <div class="min-h-screen">
            <nav class="sticky top-0 z-40 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-lg border-b border-neutral-200 dark:border-neutral-800">
                <div class="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
                    <button id="btnBack" class="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                        </svg>
                    </button>
                    <h1 class="text-lg font-bold">Nouvelle capsule</h1>
                    <div class="ml-auto">${this.themeToggleBtn()}</div>
                </div>
            </nav>
            <div class="max-w-2xl mx-auto px-4 sm:px-6 py-8">
                <div class="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
                    <form id="createCapsuleForm" class="space-y-5">
                        <div>
                            <label class="block text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">Titre de la capsule *</label>
                            <input type="text" name="title" required maxlength="150"
                                class="w-full px-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                                placeholder="Ex: Voyage au Japon 2025">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">Description</label>
                            <textarea name="description" rows="3"
                                class="w-full px-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition resize-none"
                                placeholder="Décrivez cette capsule..."></textarea>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">Date d'ouverture *</label>
                            <input type="date" name="opening_date" required min="${minDate}"
                                class="w-full px-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition">
                        </div>
                        <button type="submit"
                            class="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition shadow-sm">
                            Créer la capsule
                        </button>
                    </form>
                </div>
            </div>
        </div>`;

        document.getElementById('btnBack').addEventListener('click', () => this.navigate('dashboard'));

        document.getElementById('createCapsuleForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            try {
                await api.capsules.create(form.title.value, form.description.value, form.opening_date.value);
                this.toast('Capsule créée avec succès !');
                this.navigate('dashboard');
            } catch (err) {
                this.toast(err.message, 'error');
            }
        });
    },

    // ─────────────────────────────────────────
    //  CAPSULE DETAIL
    // ─────────────────────────────────────────
    async renderCapsuleDetail(container, capsuleId) {
        container.innerHTML = `
        <div class="min-h-screen flex items-center justify-center">
            <div class="animate-pulse text-neutral-400 text-sm">Chargement de la capsule...</div>
        </div>`;

        try {
            const data = await api.capsules.detail(capsuleId);
            const { capsule, members, memories } = data;
            const isOpen = capsule.is_opened == 1;
            const isCreator = capsule.creator_id == this.currentUser?.id;
            const daysLeft = Math.ceil((new Date(capsule.opening_date) - new Date()) / (1000 * 60 * 60 * 24));

            container.innerHTML = `
            <div class="min-h-screen">
                <!-- Navbar -->
                <nav class="sticky top-0 z-40 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-lg border-b border-neutral-200 dark:border-neutral-800">
                    <div class="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
                        <button id="btnBackDash" class="flex items-center gap-1.5 p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition text-sm">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                            </svg>
                            Retour
                        </button>
                        <div class="flex items-center gap-2">
                            ${this.themeToggleBtn()}
                            ${isCreator ? `
                            <button id="btnDeleteCapsule" class="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition" title="Supprimer">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                </svg>
                            </button>` : ''}
                        </div>
                    </div>
                </nav>

                <div class="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">

                    <!-- Header Card -->
                    <div class="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
                        <div class="flex flex-col sm:flex-row items-start gap-4">
                            <div class="w-14 h-14 rounded-2xl ${isOpen ? 'bg-green-100 dark:bg-green-900/30' : 'bg-neutral-200 dark:bg-neutral-800'} flex items-center justify-center flex-shrink-0">
                                ${isOpen
                                    ? '<svg class="w-7 h-7 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"/></svg>'
                                    : '<svg class="w-7 h-7 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>'}
                            </div>
                            <div class="flex-1">
                                <h1 class="text-xl sm:text-2xl font-bold mb-1.5">${this.escapeHtml(capsule.title)}</h1>
                                <p class="text-neutral-500 text-sm mb-3">${this.escapeHtml(capsule.description || 'Aucune description')}</p>
                                <div class="flex flex-wrap gap-2 text-xs">
                                    <span class="px-2.5 py-1 rounded-full font-medium ${isOpen ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'}">
                                        ${isOpen ? 'Ouverte !' : 'Scellée — ' + (daysLeft > 0 ? 'J-' + daysLeft : 'Ouverture imminente')}
                                    </span>
                                    <span class="px-2.5 py-1 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                                        ${new Date(capsule.opening_date).toLocaleDateString('fr-FR', {day: 'numeric', month: 'long', year: 'numeric'})}
                                    </span>
                                    <span class="px-2.5 py-1 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                                        par ${this.escapeHtml(capsule.creator_name)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Members -->
                    <div class="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
                        <h3 class="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-4">Membres (${members.length})</h3>
                        <div class="flex flex-wrap gap-2 mb-4">
                            ${members.map(m => `
                                <div class="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 rounded-full px-3 py-1.5">
                                    <div class="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center text-white text-[10px] font-bold">
                                        ${m.username.charAt(0).toUpperCase()}
                                    </div>
                                    <span class="text-sm font-medium">${this.escapeHtml(m.username)}</span>
                                    ${m.role === 'creator' ? '<span class="text-xs text-green-600 dark:text-green-400">•</span>' : ''}
                                </div>
                            `).join('')}
                        </div>
                        ${isCreator && !isOpen ? `
                        <div class="flex gap-2">
                            <input type="text" id="inviteUsername" placeholder="Pseudo de l'ami à inviter"
                                class="flex-1 px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition">
                            <button id="btnInvite"
                                class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition text-sm">
                                Inviter
                            </button>
                        </div>` : ''}
                    </div>

                    ${!isOpen ? `
                    <!-- Add memory -->
                    <div class="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
                        <h3 class="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-4">Ajouter un souvenir</h3>
                        <form id="memoryForm" class="space-y-3">
                            <textarea name="text_content" rows="3"
                                class="w-full px-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition resize-none"
                                placeholder="Écrivez votre souvenir ici..."></textarea>
                            <div class="flex flex-col sm:flex-row gap-3">
                                <label class="flex-1 cursor-pointer">
                                    <div class="flex items-center gap-2 px-4 py-2.5 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl hover:border-green-400 transition text-sm">
                                        <svg class="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                        </svg>
                                        <span class="text-neutral-500" id="imageLabel">Ajouter une photo</span>
                                    </div>
                                    <input type="file" name="image" accept="image/*" class="hidden" id="imageInput">
                                </label>
                                <button type="submit"
                                    class="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition text-sm">
                                    Ajouter
                                </button>
                            </div>
                        </form>
                    </div>` : ''}

                    <!-- Memories -->
                    <div class="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
                        <h3 class="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-4">
                            ${isOpen ? 'Tous les souvenirs dévoilés' : 'Mes souvenirs'}
                        </h3>
                        <div id="memoriesList" class="space-y-4">
                            ${memories.length === 0
                                ? `<p class="text-neutral-400 text-center py-8 text-sm">${isOpen ? 'Aucun souvenir dans cette capsule.' : 'Vous n\'avez pas encore ajouté de souvenirs.'}</p>`
                                : memories.map(mem => this.renderMemoryCard(mem, isOpen)).join('')}
                        </div>
                    </div>
                </div>
            </div>`;

            // Events
            document.getElementById('btnBackDash').addEventListener('click', () => this.navigate('dashboard'));

            if (isCreator) {
                const delBtn = document.getElementById('btnDeleteCapsule');
                if (delBtn) {
                    delBtn.addEventListener('click', async () => {
                        if (confirm('Supprimer définitivement cette capsule et tous ses souvenirs ?')) {
                            try {
                                await api.capsules.delete(capsuleId);
                                this.toast('Capsule supprimée.', 'info');
                                this.navigate('dashboard');
                            } catch (err) {
                                this.toast(err.message, 'error');
                            }
                        }
                    });
                }
            }

            const invBtn = document.getElementById('btnInvite');
            if (invBtn) {
                invBtn.addEventListener('click', async () => {
                    const input = document.getElementById('inviteUsername');
                    const username = input.value.trim();
                    if (!username) return;
                    try {
                        await api.invitations.send(capsuleId, username);
                        this.toast('Invitation envoyée !');
                        input.value = '';
                    } catch (err) {
                        this.toast(err.message, 'error');
                    }
                });
            }

            const imageInput = document.getElementById('imageInput');
            if (imageInput) {
                imageInput.addEventListener('change', () => {
                    const label = document.getElementById('imageLabel');
                    label.textContent = imageInput.files[0] ? imageInput.files[0].name : 'Ajouter une photo';
                });
            }

            const memForm = document.getElementById('memoryForm');
            if (memForm) {
                memForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const textContent = e.target.text_content.value.trim();
                    const imageFile = document.getElementById('imageInput')?.files[0] || null;

                    if (!textContent && !imageFile) {
                        this.toast('Ajoutez un texte ou une photo.', 'error');
                        return;
                    }

                    try {
                        await api.memories.add(capsuleId, textContent, imageFile);
                        this.toast('Souvenir ajouté !');
                        this.renderCapsuleDetail(container, capsuleId);
                    } catch (err) {
                        this.toast(err.message, 'error');
                    }
                });
            }

        } catch (err) {
            container.innerHTML = `
            <div class="min-h-screen flex items-center justify-center">
                <div class="text-center">
                    <p class="text-red-500 mb-4 text-sm">${this.escapeHtml(err.message)}</p>
                    <button onclick="app.navigate('dashboard')" class="text-green-600 dark:text-green-400 hover:underline text-sm font-medium">Retour au dashboard</button>
                </div>
            </div>`;
        }
    },

    // ── Memory Card ──────────────────────────
    renderMemoryCard(mem, isOpen) {
        const canDelete = mem.user_id == this.currentUser?.id && !isOpen;
        return `
        <div class="border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 hover:border-neutral-300 dark:hover:border-neutral-700 transition">
            <div class="flex items-center justify-between mb-2.5">
                <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center text-white text-[10px] font-bold">
                        ${mem.username.charAt(0).toUpperCase()}
                    </div>
                    <span class="font-medium text-sm">${this.escapeHtml(mem.username)}</span>
                    <span class="text-neutral-400 text-xs">${new Date(mem.created_at).toLocaleDateString('fr-FR')}</span>
                </div>
                ${canDelete ? `
                <button onclick="app.deleteMemory(${mem.id})" class="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 hover:text-red-500 transition">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                </button>` : ''}
            </div>
            ${mem.text_content ? `<p class="text-sm text-neutral-700 dark:text-neutral-300 mb-3 whitespace-pre-wrap">${this.escapeHtml(mem.text_content)}</p>` : ''}
            ${mem.image_path ? `<img src="${mem.image_path}" alt="Souvenir" class="rounded-xl max-h-72 w-auto object-cover border border-neutral-200 dark:border-neutral-800">` : ''}
        </div>`;
    },

    async deleteMemory(memoryId) {
        if (!confirm('Supprimer ce souvenir ?')) return;
        try {
            await api.memories.delete(memoryId);
            this.toast('Souvenir supprimé.', 'info');
            const capsuleId = new URL(window.location.href).searchParams.get('capsule');
            this.navigate('capsule', { id: capsuleId });
        } catch (err) {
            this.toast(err.message, 'error');
        }
    },

    /** Échappe le HTML pour prévenir XSS */
    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};

// Lancer l'app au chargement
document.addEventListener('DOMContentLoaded', () => app.init());
