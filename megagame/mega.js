// Элементы DOM
const loginBtn = document.getElementById('loginBtn');
const playBtn = document.getElementById('playBtn');
const profileBtn = document.getElementById('profileBtn');
const userMenuBtn = document.getElementById('userMenuBtn');
const authForms = document.getElementById('authForms');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');
const loginFormElement = document.getElementById('loginFormElement');
const regForm = document.getElementById('regForm');
const cancelLogin = document.getElementById('cancelLogin');
const cancelReg = document.getElementById('cancelReg');
const userMenu = document.getElementById('userMenu');
const userName = document.getElementById('userName');
const userEmail = document.getElementById('userEmail');
const logoutBtn = document.getElementById('logoutBtn');

// Элементы профиля
const mainPage = document.getElementById('mainPage');
const profilePage = document.getElementById('profilePage');
const backToMainBtn = document.getElementById('backToMainBtn');
const profileTab = document.getElementById('profileTab');
const settingsTab = document.getElementById('settingsTab');
const accountTab = document.getElementById('accountTab');
const profileSection = document.getElementById('profileSection');
const settingsSection = document.getElementById('settingsSection');
const accountSection = document.getElementById('accountSection');
const profileUsername = document.getElementById('profileUsername');
const profileEmail = document.getElementById('profileEmail');
const profileDate = document.getElementById('profileDate');
const daysRegistered = document.getElementById('daysRegistered');
const gamesPlayed = document.getElementById('gamesPlayed');
const lastLogin = document.getElementById('lastLogin');
const changeUsernameBtn = document.getElementById('changeUsernameBtn');
const changePasswordBtn = document.getElementById('changePasswordBtn');
const exportDataBtn = document.getElementById('exportDataBtn');
const logoutAccountBtn = document.getElementById('logoutAccountBtn');
const deleteAccountBtn = document.getElementById('deleteAccountBtn');

// Система временного storage
class TempStorage {
    constructor() {
        this.storageKey = 'ndnStore_tempData';
        this.data = this.loadData();
    }
    
    loadData() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            return saved ? JSON.parse(saved) : {
                users: [],
                sessions: [],
                games: [],
                settings: {},
                lastUpdated: Date.now()
            };
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            return {
                users: [],
                sessions: [],
                games: [],
                settings: {},
                lastUpdated: Date.now()
            };
        }
    }
    
    saveData() {
        try {
            this.data.lastUpdated = Date.now();
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        } catch (error) {
            console.error('Ошибка сохранения данных:', error);
        }
    }
    
    addUser(userData) {
        const user = {
            id: Date.now().toString(),
            ...userData,
            passwordHash: this.hashPassword(userData.password),
            createdAt: new Date().toISOString(),
            lastLogin: null,
            isActive: true
        };
        this.data.users.push(user);
        this.saveData();
        return user;
    }
    
    findUserByEmail(email) {
        return this.data.users.find(user => 
            user.email.toLowerCase() === email.toLowerCase() && user.isActive
        );
    }
    
    updateUserLogin(email) {
        const user = this.findUserByEmail(email);
        if (user) {
            user.lastLogin = new Date().toISOString();
            this.saveData();
        }
        return user;
    }
    
    deleteUser(email) {
        const userIndex = this.data.users.findIndex(user => 
            user.email.toLowerCase() === email.toLowerCase()
        );
        if (userIndex !== -1) {
            this.data.users[userIndex].isActive = false;
            this.saveData();
            return true;
        }
        return false;
    }
    
    addSession(userId, rememberMe = false) {
        const session = {
            id: Date.now().toString(),
            userId: userId,
            createdAt: new Date().toISOString(),
            expiresAt: rememberMe ? 
                new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : // 30 дней
                new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 1 день
            isActive: true
        };
        this.data.sessions.push(session);
        this.saveData();
        return session;
    }
    
    validateSession(sessionId) {
        const session = this.data.sessions.find(s => 
            s.id === sessionId && s.isActive && new Date(s.expiresAt) > new Date()
        );
        return session;
    }
    
    clearExpiredSessions() {
        const now = new Date();
        this.data.sessions = this.data.sessions.filter(session => 
            session.isActive && new Date(session.expiresAt) > now
        );
        this.saveData();
    }
    
    hashPassword(password) {
        // Простая хеш-функция для демонстрации
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString();
    }
    
    verifyPassword(password, hash) {
        return this.hashPassword(password) === hash;
    }
    
    getStorageInfo() {
        return {
            totalUsers: this.data.users.length,
            activeUsers: this.data.users.filter(u => u.isActive).length,
            totalSessions: this.data.sessions.length,
            activeSessions: this.data.sessions.filter(s => s.isActive).length,
            lastUpdated: new Date(this.data.lastUpdated).toLocaleString()
        };
    }
}

// Система мультиязычности
class LanguageManager {
    constructor() {
        this.currentLanguage = localStorage.getItem('ndnStore_language') || 'ru';
        this.translations = {
            ru: {
                welcome: 'Добро пожаловать в мир игр!',
                description: 'Откройте для себя удивительную коллекцию игр и получите незабываемые впечатления',
                login: 'Войти',
                play: 'Начать играть',
                profile: 'Профиль',
                register: 'Регистрация',
                username: 'Имя пользователя',
                email: 'Email',
                password: 'Пароль',
                confirmPassword: 'Подтвердите пароль',
                rememberMe: 'Запомнить меня',
                cancel: 'Отмена',
                profileInfo: 'Информация о профиле',
                daysInSystem: 'дней в системе',
                gamesPlayed: 'игр сыграно',
                lastLogin: 'последний вход',
                settings: 'Настройки',
                language: 'Язык интерфейса',
                theme: 'Тема оформления',
                light: 'Светлая',
                dark: 'Темная',
                auto: 'Авто',
                notifications: 'Уведомления',
                emailNotifications: 'Email уведомления',
                gameNotifications: 'Уведомления об играх',
                newsNotifications: 'Новости и обновления',
                accountManagement: 'Управление аккаунтом',
                changeData: 'Изменение данных',
                changeUsername: 'Изменить имя пользователя',
                changePassword: 'Изменить пароль',
                exportData: 'Экспорт данных',
                downloadData: 'Скачать данные',
                dangerZone: 'Опасная зона',
                logout: 'Выйти из аккаунта',
                deleteAccount: 'Удалить аккаунт',
                back: 'Назад',
                registered: 'Зарегистрирован',
                // Дополнительные переводы
                games: 'Игры',
                aboutUs: 'О нас',
                contacts: 'Контакты',
                loginTitle: 'Вход в аккаунт',
                registerTitle: 'Регистрация',
                enterPassword: 'Введите пароль',
                passwordRequirements: {
                    length: 'Минимум 8 символов',
                    uppercase: 'Заглавная буква',
                    lowercase: 'Строчная буква',
                    number: 'Цифра',
                    special: 'Специальный символ'
                },
                passwordStrength: {
                    weak: 'Слабый пароль',
                    fair: 'Удовлетворительный пароль',
                    good: 'Хороший пароль',
                    strong: 'Отличный пароль'
                },
                passwordMatch: 'Пароли совпадают',
                passwordNoMatch: 'Пароли не совпадают',
                fastDownload: 'Быстрая загрузка',
                fastDownloadDesc: 'Мгновенная загрузка игр',
                security: 'Безопасность',
                securityDesc: 'Защищенные платежи',
                support247: 'Поддержка 24/7',
                support247Desc: 'Всегда готовы помочь',
                ndnStore: 'NDN Store',
                bestGameStore: 'Лучший игровой магазин',
                followUs: 'Следите за нами',
                allRightsReserved: 'Все права защищены.',
                today: 'Сегодня',
                daysAgo: 'дней назад',
                // Сообщения об ошибках
                userNotFound: 'Пользователь с таким email не найден!',
                wrongPassword: 'Неверный пароль!',
                passwordsNotMatch: 'Пароли не совпадают!',
                userExists: 'Пользователь с таким email уже существует!',
                welcomeBack: 'Добро пожаловать обратно',
                welcomeToStore: 'Добро пожаловать в NDN Store',
                registrationSuccess: 'Регистрация успешна!',
                logoutSuccess: 'Вы успешно вышли из аккаунта!',
                accountDeleted: 'Аккаунт успешно удален!',
                usernameChanged: 'Имя пользователя успешно изменено!',
                passwordChanged: 'Пароль успешно изменен!',
                dataExported: 'Данные успешно экспортированы!',
                // Валидация
                usernameMinLength: 'Имя пользователя должно содержать минимум 3 символа!',
                usernameMaxLength: 'Имя пользователя не должно превышать 20 символов!',
                usernameInvalidChars: 'Имя пользователя может содержать только буквы, цифры и подчеркивания!',
                usernameStartLetter: 'Имя пользователя должно начинаться с буквы!',
                emailRequired: 'Email адрес обязателен!',
                emailTooLong: 'Email адрес слишком длинный!',
                emailInvalid: 'Пожалуйста, введите корректный email адрес!',
                emailOneAt: 'Email адрес должен содержать один символ @!',
                emailLocalInvalid: 'Некорректная локальная часть email адреса!',
                emailDomainInvalid: 'Некорректная доменная часть email адреса!',
                emailStartEndDot: 'Email не может начинаться или заканчиваться точкой!',
                emailDoubleDot: 'Email не может содержать двойные точки!',
                passwordMinLength: 'Пароль должен содержать минимум 8 символов!',
                passwordMaxLength: 'Пароль не должен превышать 128 символов!',
                passwordUppercase: 'Пароль должен содержать хотя бы одну заглавную букву!',
                passwordLowercase: 'Пароль должен содержать хотя бы одну строчную букву!',
                passwordNumber: 'Пароль должен содержать хотя бы одну цифру!',
                passwordSpecial: 'Пароль должен содержать хотя бы один специальный символ (!@#$%^&* и т.д.)!',
                passwordNoSpaces: 'Пароль не должен содержать пробелы!',
                passwordCommon: 'Этот пароль слишком распространен. Выберите более сложный пароль!',
                // Игры
                selectGame: 'Выберите игру',
                spaceAdventure: 'Space Adventure',
                spaceAdventureDesc: 'Космические приключения',
                medievalQuest: 'Война рыцарей',
                medievalQuestDesc: 'Средневековые приключения',
                racingPro: 'Racing Pro',
                racingProDesc: 'Гонки на выживание',
                blastThree: 'Blast Three',
                blastThreeDesc: 'Взрывная головоломка',
                gameLoading: 'Игра загружается...',
                // Подтверждения
                logoutConfirm: 'Выйти из аккаунта?',
                logoutConfirmText: 'Вы уверены, что хотите выйти из аккаунта?',
                yesLogout: 'Да, выйти',
                deleteAccountConfirm: 'Удалить аккаунт?',
                deleteAccountText: 'Это действие необратимо! Все ваши данные будут удалены навсегда.',
                deleteAccountWarning: 'Внимание: Вы потеряете доступ ко всем играм и данным.',
                yesDelete: 'Да, удалить',
                enterCurrentPassword: 'Введите текущий пароль:',
                enterNewPassword: 'Введите новый пароль:',
                wrongCurrentPassword: 'Неверный пароль!'
            },
            en: {
                welcome: 'Welcome to the world of games!',
                description: 'Discover an amazing collection of games and get unforgettable experiences',
                login: 'Login',
                play: 'Start Playing',
                profile: 'Profile',
                register: 'Registration',
                username: 'Username',
                email: 'Email',
                password: 'Password',
                confirmPassword: 'Confirm Password',
                rememberMe: 'Remember me',
                cancel: 'Cancel',
                profileInfo: 'Profile Information',
                daysInSystem: 'days in system',
                gamesPlayed: 'games played',
                lastLogin: 'last login',
                settings: 'Settings',
                language: 'Interface Language',
                theme: 'Theme',
                light: 'Light',
                dark: 'Dark',
                auto: 'Auto',
                notifications: 'Notifications',
                emailNotifications: 'Email notifications',
                gameNotifications: 'Game notifications',
                newsNotifications: 'News and updates',
                accountManagement: 'Account Management',
                changeData: 'Change Data',
                changeUsername: 'Change Username',
                changePassword: 'Change Password',
                exportData: 'Export Data',
                downloadData: 'Download Data',
                dangerZone: 'Danger Zone',
                logout: 'Logout',
                deleteAccount: 'Delete Account',
                back: 'Back',
                registered: 'Registered',
                // Additional translations
                games: 'Games',
                aboutUs: 'About Us',
                contacts: 'Contacts',
                loginTitle: 'Login to Account',
                registerTitle: 'Registration',
                enterPassword: 'Enter password',
                passwordRequirements: {
                    length: 'Minimum 8 characters',
                    uppercase: 'Uppercase letter',
                    lowercase: 'Lowercase letter',
                    number: 'Number',
                    special: 'Special character'
                },
                passwordStrength: {
                    weak: 'Weak password',
                    fair: 'Fair password',
                    good: 'Good password',
                    strong: 'Strong password'
                },
                passwordMatch: 'Passwords match',
                passwordNoMatch: 'Passwords do not match',
                fastDownload: 'Fast Download',
                fastDownloadDesc: 'Instant game downloads',
                security: 'Security',
                securityDesc: 'Secure payments',
                support247: '24/7 Support',
                support247Desc: 'Always ready to help',
                ndnStore: 'NDN Store',
                bestGameStore: 'Best game store',
                followUs: 'Follow us',
                allRightsReserved: 'All rights reserved.',
                today: 'Today',
                daysAgo: 'days ago',
                // Error messages
                userNotFound: 'User with this email not found!',
                wrongPassword: 'Wrong password!',
                passwordsNotMatch: 'Passwords do not match!',
                userExists: 'User with this email already exists!',
                welcomeBack: 'Welcome back',
                welcomeToStore: 'Welcome to NDN Store',
                registrationSuccess: 'Registration successful!',
                logoutSuccess: 'You have successfully logged out!',
                accountDeleted: 'Account successfully deleted!',
                usernameChanged: 'Username successfully changed!',
                passwordChanged: 'Password successfully changed!',
                dataExported: 'Data successfully exported!',
                // Validation
                usernameMinLength: 'Username must contain at least 3 characters!',
                usernameMaxLength: 'Username must not exceed 20 characters!',
                usernameInvalidChars: 'Username can only contain letters, numbers and underscores!',
                usernameStartLetter: 'Username must start with a letter!',
                emailRequired: 'Email address is required!',
                emailTooLong: 'Email address is too long!',
                emailInvalid: 'Please enter a valid email address!',
                emailOneAt: 'Email address must contain one @ symbol!',
                emailLocalInvalid: 'Invalid local part of email address!',
                emailDomainInvalid: 'Invalid domain part of email address!',
                emailStartEndDot: 'Email cannot start or end with a dot!',
                emailDoubleDot: 'Email cannot contain double dots!',
                passwordMinLength: 'Password must contain at least 8 characters!',
                passwordMaxLength: 'Password must not exceed 128 characters!',
                passwordUppercase: 'Password must contain at least one uppercase letter!',
                passwordLowercase: 'Password must contain at least one lowercase letter!',
                passwordNumber: 'Password must contain at least one number!',
                passwordSpecial: 'Password must contain at least one special character (!@#$%^&* etc.)!',
                passwordNoSpaces: 'Password must not contain spaces!',
                passwordCommon: 'This password is too common. Choose a more complex password!',
                // Games
                selectGame: 'Select Game',
                spaceAdventure: 'Space Adventure',
                spaceAdventureDesc: 'Space adventures',
                medievalQuest: 'Knights War',
                medievalQuestDesc: 'Medieval adventures',
                racingPro: 'Racing Pro',
                racingProDesc: 'Survival racing',
                blastThree: 'Blast Three',
                blastThreeDesc: 'Explosive puzzle',
                gameLoading: 'Game loading...',
                // Confirmations
                logoutConfirm: 'Logout from account?',
                logoutConfirmText: 'Are you sure you want to logout from your account?',
                yesLogout: 'Yes, logout',
                deleteAccountConfirm: 'Delete account?',
                deleteAccountText: 'This action is irreversible! All your data will be deleted forever.',
                deleteAccountWarning: 'Warning: You will lose access to all games and data.',
                yesDelete: 'Yes, delete',
                enterCurrentPassword: 'Enter current password:',
                enterNewPassword: 'Enter new password:',
                wrongCurrentPassword: 'Wrong password!'
            }
        };
    }
    
    setLanguage(lang) {
        this.currentLanguage = lang;
        localStorage.setItem('ndnStore_language', lang);
        this.updateUI();
    }
    
    getText(key) {
        const keys = key.split('.');
        let value = this.translations[this.currentLanguage];
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return key; // Возвращаем ключ если перевод не найден
            }
        }
        
        return value || key;
    }
    
    updateUI() {
        // Обновляем основные элементы
        document.querySelector('.hero-title').textContent = this.getText('welcome');
        document.querySelector('.hero-description').textContent = this.getText('description');
        
        // Обновляем навигацию
        const navLinks = document.querySelectorAll('.nav-link');
        if (navLinks[0]) navLinks[0].textContent = this.getText('games');
        if (navLinks[1]) navLinks[1].textContent = this.getText('aboutUs');
        if (navLinks[2]) navLinks[2].textContent = this.getText('contacts');
        
        // Обновляем кнопки
        const loginBtnText = document.querySelector('#loginBtn');
        if (loginBtnText) loginBtnText.innerHTML = `<i class="fas fa-sign-in-alt"></i> ${this.getText('login')}`;
        
        const playBtnText = document.querySelector('#playBtn');
        if (playBtnText) playBtnText.innerHTML = `<i class="fas fa-play"></i> ${this.getText('play')}`;
        
        const profileBtnText = document.querySelector('#profileBtn');
        if (profileBtnText) profileBtnText.innerHTML = `<i class="fas fa-user-cog"></i> ${this.getText('profile')}`;
        
        const userMenuBtnText = document.querySelector('#userMenuBtn');
        if (userMenuBtnText) userMenuBtnText.innerHTML = `<i class="fas fa-user"></i>`;
        
        // Обновляем футер
        this.updateFooter();
        
        // Обновляем формы
        this.updateForms();
        this.updateProfile();
        this.updateFeatures();
    }
    
    updateForms() {
        const loginTabText = document.querySelector('#loginTab');
        if (loginTabText) loginTabText.innerHTML = `<i class="fas fa-sign-in-alt"></i> ${this.getText('login')}`;
        
        const registerTabText = document.querySelector('#registerTab');
        if (registerTabText) registerTabText.innerHTML = `<i class="fas fa-user-plus"></i> ${this.getText('register')}`;
        
        // Обновляем заголовки форм
        const loginFormTitle = document.querySelector('#loginFormTitle');
        if (loginFormTitle) loginFormTitle.textContent = this.getText('loginTitle');
        
        const registerFormTitle = document.querySelector('#registerFormTitle');
        if (registerFormTitle) registerFormTitle.textContent = this.getText('registerTitle');
        
        // Обновляем поля форм
        const usernameField = document.querySelector('#username');
        if (usernameField) usernameField.placeholder = this.getText('username');
        
        const emailField = document.querySelector('#email');
        if (emailField) emailField.placeholder = this.getText('email');
        
        const passwordField = document.querySelector('#password');
        if (passwordField) passwordField.placeholder = this.getText('password');
        
        const confirmPasswordField = document.querySelector('#confirmPassword');
        if (confirmPasswordField) confirmPasswordField.placeholder = this.getText('confirmPassword');
        
        const rememberMeField = document.querySelector('#rememberMe');
        if (rememberMeField) {
            const label = rememberMeField.nextElementSibling;
            if (label) label.textContent = this.getText('rememberMe');
        }
        
        // Обновляем требования к паролю
        this.updatePasswordRequirements();
    }
    
    updatePasswordRequirements() {
        const requirements = document.querySelectorAll('.requirement');
        if (requirements[0]) requirements[0].textContent = this.getText('passwordRequirements.length');
        if (requirements[1]) requirements[1].textContent = this.getText('passwordRequirements.uppercase');
        if (requirements[2]) requirements[2].textContent = this.getText('passwordRequirements.lowercase');
        if (requirements[3]) requirements[3].textContent = this.getText('passwordRequirements.number');
        if (requirements[4]) requirements[4].textContent = this.getText('passwordRequirements.special');
    }
    
    updateProfile() {
        // Обновляем профиль если он открыт
        if (profilePage && profilePage.style.display !== 'none') {
            const profileInfoText = document.querySelector('#profileSection h3');
            if (profileInfoText) profileInfoText.textContent = this.getText('profileInfo');
            
            const settingsText = document.querySelector('#settingsSection h3');
            if (settingsText) settingsText.textContent = this.getText('settings');
            
            const accountText = document.querySelector('#accountSection h3');
            if (accountText) accountText.textContent = this.getText('accountManagement');
        }
    }
    
    updateFooter() {
        // Обновляем футер
        const footerSections = document.querySelectorAll('.footer-section h4');
        if (footerSections[0]) footerSections[0].textContent = this.getText('ndnStore');
        if (footerSections[1]) footerSections[1].textContent = this.getText('followUs');
        
        const footerParagraphs = document.querySelectorAll('.footer-section p');
        if (footerParagraphs[0]) footerParagraphs[0].textContent = this.getText('bestGameStore');
        
        const footerBottom = document.querySelector('.footer-bottom p');
        if (footerBottom) {
            const currentYear = new Date().getFullYear();
            footerBottom.textContent = `© ${currentYear} ${this.getText('ndnStore')}. ${this.getText('allRightsReserved')}`;
        }
    }
    
    updateFeatures() {
        // Обновляем секцию features
        const features = document.querySelectorAll('.feature');
        if (features[0]) {
            const h3 = features[0].querySelector('h3');
            const p = features[0].querySelector('p');
            if (h3) h3.textContent = this.getText('fastDownload');
            if (p) p.textContent = this.getText('fastDownloadDesc');
        }
        if (features[1]) {
            const h3 = features[1].querySelector('h3');
            const p = features[1].querySelector('p');
            if (h3) h3.textContent = this.getText('security');
            if (p) p.textContent = this.getText('securityDesc');
        }
        if (features[2]) {
            const h3 = features[2].querySelector('h3');
            const p = features[2].querySelector('p');
            if (h3) h3.textContent = this.getText('support247');
            if (p) p.textContent = this.getText('support247Desc');
        }
    }
}

// Система настроек
class SettingsManager {
    constructor() {
        this.settings = {
            language: localStorage.getItem('ndnStore_language') || 'ru',
            theme: localStorage.getItem('ndnStore_theme') || 'light',
            notifications: {
                email: localStorage.getItem('ndnStore_emailNotifications') !== 'false',
                games: localStorage.getItem('ndnStore_gameNotifications') !== 'false',
                news: localStorage.getItem('ndnStore_newsNotifications') === 'true'
            }
        };
    }
    
    saveSettings() {
        localStorage.setItem('ndnStore_language', this.settings.language);
        localStorage.setItem('ndnStore_theme', this.settings.theme);
        localStorage.setItem('ndnStore_emailNotifications', this.settings.notifications.email);
        localStorage.setItem('ndnStore_gameNotifications', this.settings.notifications.games);
        localStorage.setItem('ndnStore_newsNotifications', this.settings.notifications.news);
    }
    
    applyTheme(theme) {
        this.settings.theme = theme;
        document.body.className = `theme-${theme}`;
        this.saveSettings();
    }
}

// Инициализация систем
const languageManager = new LanguageManager();
const settingsManager = new SettingsManager();

// Инициализация временного storage
const tempStorage = new TempStorage();

// Очищаем истекшие сессии при загрузке
tempStorage.clearExpiredSessions();

// Проверяем, зарегистрирован ли пользователь
let isRegistered = localStorage.getItem('isRegistered') === 'true';
let userData = JSON.parse(localStorage.getItem('userData') || '{}');

// Проверяем валидность сессии
if (isRegistered && userData.sessionId) {
    const session = tempStorage.validateSession(userData.sessionId);
    if (!session) {
        // Сессия истекла, выходим из аккаунта
        localStorage.removeItem('userData');
        localStorage.removeItem('isRegistered');
        isRegistered = false;
        userData = {};
    }
}

// Показываем кнопку "Начать играть" если пользователь уже зарегистрирован
if (isRegistered) {
    showPlayButton();
    updateLoginButton();
}

// Инициализируем язык и тему
languageManager.updateUI();
settingsManager.applyTheme(settingsManager.settings.theme);

// Добавляем информацию о storage в консоль для отладки
console.log('NDN Store - Информация о storage:', tempStorage.getStorageInfo());

// Обработчик клика на кнопку "Войти"
loginBtn.addEventListener('click', function() {
    // Показываем формы входа/регистрации только для неавторизованных пользователей
    showAuthForms();
});

// Обработчики табов
loginTab.addEventListener('click', function() {
    switchToLoginTab();
});

registerTab.addEventListener('click', function() {
    switchToRegisterTab();
});

// Обработчик формы входа
loginFormElement.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Валидация email
    if (!validateEmail(email)) {
        return;
    }
    
    // Поиск пользователя
    const user = tempStorage.findUserByEmail(email);
    if (!user) {
        showError(languageManager.getText('userNotFound'));
        return;
    }
    
    // Проверка пароля
    if (!tempStorage.verifyPassword(password, user.passwordHash)) {
        showError(languageManager.getText('wrongPassword'));
        return;
    }
    
    // Успешный вход
    loginUser(user, rememberMe);
});

// Обработчик кнопки "Отмена" для входа
cancelLogin.addEventListener('click', function() {
    hideAuthForms();
});

// Закрытие меню при клике вне его
document.addEventListener('click', function(e) {
    if (isRegistered && !loginBtn.contains(e.target) && !userMenu.contains(e.target) && !userMenuBtn.contains(e.target)) {
        hideUserMenu();
    }
});

// Обработчик кнопки "Отмена" для регистрации
cancelReg.addEventListener('click', function() {
    hideAuthForms();
});

// Обработчик отправки формы регистрации
regForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Валидация имени пользователя
    if (!validateUsername(username)) {
        return;
    }
    
    // Валидация email
    if (!validateEmail(email)) {
        return;
    }
    
    // Валидация пароля
    if (!validatePassword(password)) {
        return;
    }
    
    // Проверка совпадения паролей
    if (password !== confirmPassword) {
        showError(languageManager.getText('passwordsNotMatch'));
        return;
    }
    
    // Проверка на существующего пользователя
    if (tempStorage.findUserByEmail(email)) {
        showError(languageManager.getText('userExists'));
        return;
    }
    
    // Добавляем пользователя в временный storage
    const newUser = tempStorage.addUser({
        username: username,
        email: email,
        password: password
    });
    
    // Создаем сессию
    const session = tempStorage.addSession(newUser.id, false);
    
    // Сохраняем данные текущего пользователя
    userData = {
        id: newUser.id,
        username: username,
        email: email,
        registrationDate: newUser.createdAt,
        sessionId: session.id
    };
    
    localStorage.setItem('userData', JSON.stringify(userData));
    localStorage.setItem('isRegistered', 'true');
    
    isRegistered = true;
    
    // Скрываем формы и показываем кнопку "Начать играть"
    hideAuthForms();
    showPlayButton();
    updateLoginButton();
    showSuccessMessage(`${languageManager.getText('welcomeToStore')}, ${username}!`);
    
    // Очищаем форму
    regForm.reset();
});

// Обработчик клика на кнопку "Начать играть"
playBtn.addEventListener('click', function() {
    showGameSelection();
});

// Обработчик клика на кнопку "Профиль"
profileBtn.addEventListener('click', function() {
    showProfile();
});

// Обработчик клика на кнопку меню пользователя
userMenuBtn.addEventListener('click', function() {
    // Переключаем видимость меню пользователя
    if (userMenu.style.display === 'block') {
        hideUserMenu();
    } else {
        showUserMenu();
    }
});

// Обработчик кнопки "Назад" в профиле
backToMainBtn.addEventListener('click', function() {
    hideProfile();
});

// Обработчики табов профиля
profileTab.addEventListener('click', function() {
    switchProfileTab('profile');
});

settingsTab.addEventListener('click', function() {
    switchProfileTab('settings');
});

accountTab.addEventListener('click', function() {
    switchProfileTab('account');
});

// Обработчики языков
document.querySelectorAll('.language-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const lang = this.dataset.lang;
        languageManager.setLanguage(lang);
        
        // Обновляем активную кнопку
        document.querySelectorAll('.language-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
    });
});

// Обработчики тем
document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const theme = this.dataset.theme;
        settingsManager.applyTheme(theme);
        
        // Обновляем активную кнопку
        document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
    });
});

// Обработчики уведомлений
document.getElementById('emailNotifications').addEventListener('change', function() {
    settingsManager.settings.notifications.email = this.checked;
    settingsManager.saveSettings();
});

document.getElementById('gameNotifications').addEventListener('change', function() {
    settingsManager.settings.notifications.games = this.checked;
    settingsManager.saveSettings();
});

document.getElementById('newsNotifications').addEventListener('change', function() {
    settingsManager.settings.notifications.news = this.checked;
    settingsManager.saveSettings();
});

// Обработчики управления аккаунтом
changeUsernameBtn.addEventListener('click', function() {
    showChangeUsernameDialog();
});

changePasswordBtn.addEventListener('click', function() {
    showChangePasswordDialog();
});

exportDataBtn.addEventListener('click', function() {
    exportUserData();
});

logoutAccountBtn.addEventListener('click', function() {
    logout();
});

deleteAccountBtn.addEventListener('click', function() {
    showDeleteConfirmation();
});

// Обработчик клика на кнопку "Выйти"
logoutBtn.addEventListener('click', function() {
    logout();
});

// Обработчик клика на кнопку "Удалить аккаунт"
deleteAccountBtn.addEventListener('click', function() {
    showDeleteConfirmation();
});

// Функции выхода и удаления
function logout() {
    // Показываем подтверждение
    const message = document.createElement('div');
    message.className = 'logout-confirmation';
    message.innerHTML = `
        <div class="confirmation-content">
            <h3>${languageManager.getText('logoutConfirm')}</h3>
            <p>${languageManager.getText('logoutConfirmText')}</p>
            <div class="confirmation-buttons">
                <button class="btn btn-primary" onclick="confirmLogout()">
                    <i class="fas fa-sign-out-alt"></i>
                    ${languageManager.getText('yesLogout')}
                </button>
                <button class="btn btn-secondary" onclick="this.closest('.logout-confirmation').remove()">
                    <i class="fas fa-times"></i>
                    ${languageManager.getText('cancel')}
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(message);
    
    // Стили для модального окна
    message.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease-out;
    `;
    
    const confirmationContent = message.querySelector('.confirmation-content');
    confirmationContent.style.cssText = `
        background: white;
        padding: 2rem;
        border-radius: 12px;
        text-align: center;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        animation: scaleIn 0.3s ease-out;
        max-width: 400px;
        width: 90%;
    `;
    
    const confirmationButtons = message.querySelector('.confirmation-buttons');
    confirmationButtons.style.cssText = `
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin-top: 1.5rem;
    `;
}

function confirmLogout() {
    // Деактивируем текущую сессию
    if (userData.sessionId) {
        const session = tempStorage.data.sessions.find(s => s.id === userData.sessionId);
        if (session) {
            session.isActive = false;
            tempStorage.saveData();
        }
    }
    
    // Очищаем данные пользователя
    localStorage.removeItem('userData');
    localStorage.removeItem('isRegistered');
    
    // Сбрасываем состояние
    isRegistered = false;
    userData = {};
    
    // Скрываем элементы
    hideUserMenu();
    playBtn.style.display = 'none';
    
    // Восстанавливаем кнопку входа
    updateLoginButton();
    
    // Закрываем модальное окно
    document.querySelector('.logout-confirmation').remove();
    
    // Показываем сообщение
    showSuccessMessage(languageManager.getText('logoutSuccess'));
}

function showDeleteConfirmation() {
    const message = document.createElement('div');
    message.className = 'delete-confirmation';
    message.innerHTML = `
        <div class="confirmation-content">
            <div class="warning-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h3>${languageManager.getText('deleteAccountConfirm')}</h3>
            <p>${languageManager.getText('deleteAccountText')}</p>
            <div class="warning-text">
                <strong>${languageManager.getText('deleteAccountWarning')}</strong>
            </div>
            <div class="confirmation-buttons">
                <button class="btn btn-danger" onclick="confirmDeleteAccount()">
                    <i class="fas fa-trash"></i>
                    ${languageManager.getText('yesDelete')}
                </button>
                <button class="btn btn-secondary" onclick="this.closest('.delete-confirmation').remove()">
                    <i class="fas fa-times"></i>
                    ${languageManager.getText('cancel')}
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(message);
    
    // Стили для модального окна
    message.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease-out;
    `;
    
    const confirmationContent = message.querySelector('.confirmation-content');
    confirmationContent.style.cssText = `
        background: white;
        padding: 2rem;
        border-radius: 12px;
        text-align: center;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        animation: scaleIn 0.3s ease-out;
        max-width: 450px;
        width: 90%;
    `;
    
    const warningIcon = message.querySelector('.warning-icon');
    warningIcon.style.cssText = `
        font-size: 3rem;
        color: #ef4444;
        margin-bottom: 1rem;
    `;
    
    const warningText = message.querySelector('.warning-text');
    warningText.style.cssText = `
        background: #fef2f2;
        color: #dc2626;
        padding: 1rem;
        border-radius: 8px;
        margin: 1rem 0;
        border: 1px solid #fecaca;
    `;
    
    const confirmationButtons = message.querySelector('.confirmation-buttons');
    confirmationButtons.style.cssText = `
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin-top: 1.5rem;
    `;
}

function confirmDeleteAccount() {
    // Удаляем пользователя из временного storage
    tempStorage.deleteUser(userData.email);
    
    // Деактивируем все сессии пользователя
    tempStorage.data.sessions.forEach(session => {
        if (session.userId === userData.id) {
            session.isActive = false;
        }
    });
    tempStorage.saveData();
    
    // Очищаем данные текущего пользователя
    localStorage.removeItem('userData');
    localStorage.removeItem('isRegistered');
    
    // Сбрасываем состояние
    isRegistered = false;
    userData = {};
    
    // Скрываем элементы
    hideUserMenu();
    playBtn.style.display = 'none';
    
    // Восстанавливаем кнопку входа
    updateLoginButton();
    
    // Закрываем модальное окно
    document.querySelector('.delete-confirmation').remove();
    
    // Показываем сообщение
    showSuccessMessage(languageManager.getText('accountDeleted'));
}

// Глобальные функции для модальных окон
window.confirmLogout = confirmLogout;
window.confirmDeleteAccount = confirmDeleteAccount;

// Интерактивные индикаторы пароля
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const passwordRequirements = document.getElementById('passwordRequirements');
const passwordMatch = document.getElementById('passwordMatch');

// Обработчик ввода пароля
passwordInput.addEventListener('input', function() {
    const password = this.value;
    updatePasswordStrength(password);
    updatePasswordRequirements(password);
    
    // Проверяем совпадение паролей, если поле подтверждения заполнено
    if (confirmPasswordInput.value) {
        checkPasswordMatch();
    }
});

// Обработчик ввода подтверждения пароля
confirmPasswordInput.addEventListener('input', function() {
    checkPasswordMatch();
});

function updatePasswordStrength(password) {
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');
    
    let score = 0;
    let strength = 'weak';
    
    // Подсчет очков силы пароля
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;
    
    // Определение уровня силы
    if (score >= 5) strength = 'strong';
    else if (score >= 4) strength = 'good';
    else if (score >= 2) strength = 'fair';
    else if (score >= 1) strength = 'weak';
    
    // Обновление визуальных индикаторов
    strengthFill.className = `strength-fill ${strength}`;
    strengthText.className = `strength-text ${strength}`;
    
    const strengthMessages = {
        weak: languageManager ? languageManager.getText('passwordStrength.weak') : 'Слабый пароль',
        fair: languageManager ? languageManager.getText('passwordStrength.fair') : 'Удовлетворительный пароль',
        good: languageManager ? languageManager.getText('passwordStrength.good') : 'Хороший пароль',
        strong: languageManager ? languageManager.getText('passwordStrength.strong') : 'Отличный пароль'
    };
    
    strengthText.textContent = strengthMessages[strength];
}

function updatePasswordRequirements(password) {
    const requirements = {
        'req-length': password.length >= 8,
        'req-uppercase': /[A-Z]/.test(password),
        'req-lowercase': /[a-z]/.test(password),
        'req-number': /\d/.test(password),
        'req-special': /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };
    
    // Показываем требования только если пароль не пустой
    if (password.length > 0) {
        passwordRequirements.classList.add('show');
    } else {
        passwordRequirements.classList.remove('show');
    }
    
    // Обновляем статус каждого требования
    Object.keys(requirements).forEach(reqId => {
        const element = document.getElementById(reqId);
        if (requirements[reqId]) {
            element.classList.add('valid');
        } else {
            element.classList.remove('valid');
        }
    });
}

function checkPasswordMatch() {
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    if (confirmPassword.length === 0) {
        passwordMatch.classList.remove('show');
        return;
    }
    
    passwordMatch.classList.add('show');
    
    if (password === confirmPassword) {
        passwordMatch.className = 'password-match show match';
        passwordMatch.textContent = languageManager ? languageManager.getText('passwordMatch') : 'Пароли совпадают';
    } else {
        passwordMatch.className = 'password-match show no-match';
        passwordMatch.textContent = languageManager ? languageManager.getText('passwordNoMatch') : 'Пароли не совпадают';
    }
}

// Функции управления формами
function showAuthForms() {
    authForms.style.display = 'block';
    loginBtn.style.display = 'none';
    
    // Анимация появления
    authForms.style.opacity = '0';
    authForms.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        authForms.style.transition = 'all 0.3s ease-out';
        authForms.style.opacity = '1';
        authForms.style.transform = 'translateY(0)';
    }, 10);
}

function hideAuthForms() {
    authForms.style.transition = 'all 0.3s ease-out';
    authForms.style.opacity = '0';
    authForms.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        authForms.style.display = 'none';
        loginBtn.style.display = 'inline-flex';
        // Очищаем формы
        loginFormElement.reset();
        regForm.reset();
    }, 300);
}

function switchToLoginTab() {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
}

function switchToRegisterTab() {
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    registerForm.classList.add('active');
    loginForm.classList.remove('active');
}

function loginUser(user, rememberMe) {
    // Обновляем время последнего входа
    tempStorage.updateUserLogin(user.email);
    
    // Создаем новую сессию
    const session = tempStorage.addSession(user.id, rememberMe);
    
    // Сохраняем данные текущего пользователя
    userData = {
        id: user.id,
        username: user.username,
        email: user.email,
        registrationDate: user.createdAt,
        sessionId: session.id
    };
    
    localStorage.setItem('userData', JSON.stringify(userData));
    localStorage.setItem('isRegistered', 'true');
    
    isRegistered = true;
    
    // Скрываем формы и показываем кнопку "Начать играть"
    hideAuthForms();
    showPlayButton();
    updateLoginButton();
    showSuccessMessage(`${languageManager.getText('welcomeBack')}, ${user.username}!`);
}

function showPlayButton() {
    playBtn.style.display = 'inline-flex';
    playBtn.classList.add('btn-appear');
}

function updateLoginButton() {
    if (isRegistered) {
        // Скрываем кнопку входа/регистрации
        loginBtn.style.display = 'none';
        
        // Показываем кнопки профиля и меню пользователя
        profileBtn.style.display = 'inline-flex';
        userMenuBtn.style.display = 'inline-flex';
        
        // Скрываем меню пользователя
        hideUserMenu();
    } else {
        // Показываем кнопку входа/регистрации
        loginBtn.style.display = 'inline-flex';
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> ' + languageManager.getText('login');
        loginBtn.style.background = '';
        
        // Скрываем кнопки профиля и меню пользователя
        profileBtn.style.display = 'none';
        userMenuBtn.style.display = 'none';
        
        // Скрываем меню пользователя
        hideUserMenu();
    }
}

// Функции профиля
function showProfile() {
    mainPage.style.display = 'none';
    profilePage.style.display = 'block';
    
    // Заполняем данные профиля
    updateProfileData();
    
    // Анимация появления
    profilePage.style.opacity = '0';
    profilePage.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        profilePage.style.transition = 'all 0.3s ease-out';
        profilePage.style.opacity = '1';
        profilePage.style.transform = 'translateY(0)';
    }, 10);
}

function hideProfile() {
    profilePage.style.transition = 'all 0.3s ease-out';
    profilePage.style.opacity = '0';
    profilePage.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        profilePage.style.display = 'none';
        mainPage.style.display = 'block';
    }, 300);
}

function updateProfileData() {
    if (!isRegistered) return;
    
    // Основная информация
    profileUsername.textContent = userData.username;
    profileEmail.textContent = userData.email;
    
    // Дата регистрации
    const regDate = new Date(userData.registrationDate);
    profileDate.textContent = `${languageManager.getText('registered')}: ${regDate.toLocaleDateString()}`;
    
    // Статистика
    const daysSinceReg = Math.floor((Date.now() - regDate.getTime()) / (1000 * 60 * 60 * 24));
    daysRegistered.textContent = daysSinceReg;
    
    // Получаем данные пользователя из storage
    const user = tempStorage.findUserByEmail(userData.email);
    if (user) {
        gamesPlayed.textContent = user.gamesPlayed || 0;
        
        if (user.lastLogin) {
            const lastLoginDate = new Date(user.lastLogin);
            const today = new Date();
            const diffTime = Math.abs(today - lastLoginDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                lastLogin.textContent = languageManager.getText('today');
            } else {
                lastLogin.textContent = `${diffDays} ${languageManager.getText('daysAgo')}`;
            }
        }
    }
}

function switchProfileTab(tabName) {
    // Убираем активные классы
    document.querySelectorAll('.profile-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.profile-section').forEach(section => section.classList.remove('active'));
    
    // Добавляем активные классы
    if (tabName === 'profile') {
        profileTab.classList.add('active');
        profileSection.classList.add('active');
    } else if (tabName === 'settings') {
        settingsTab.classList.add('active');
        settingsSection.classList.add('active');
    } else if (tabName === 'account') {
        accountTab.classList.add('active');
        accountSection.classList.add('active');
    }
}

function showChangeUsernameDialog() {
    const newUsername = prompt(languageManager.getText('changeUsername') + ':', userData.username);
    if (newUsername && newUsername.trim() !== '' && newUsername !== userData.username) {
        if (validateUsername(newUsername.trim())) {
            // Обновляем в storage
            const user = tempStorage.findUserByEmail(userData.email);
            if (user) {
                user.username = newUsername.trim();
                tempStorage.saveData();
                
                // Обновляем текущие данные
                userData.username = newUsername.trim();
                localStorage.setItem('userData', JSON.stringify(userData));
                
                // Обновляем UI
                updateProfileData();
                updateLoginButton();
                
                showSuccessMessage(languageManager.getText('usernameChanged'));
            }
        }
    }
}

function showChangePasswordDialog() {
    const currentPassword = prompt(languageManager.getText('enterCurrentPassword'));
    if (!currentPassword) return;
    
    // Проверяем текущий пароль
    const user = tempStorage.findUserByEmail(userData.email);
    if (!user || !tempStorage.verifyPassword(currentPassword, user.passwordHash)) {
        showError(languageManager.getText('wrongCurrentPassword'));
        return;
    }
    
    const newPassword = prompt(languageManager.getText('enterNewPassword'));
    if (!newPassword) return;
    
    if (validatePassword(newPassword)) {
        // Обновляем пароль в storage
        user.passwordHash = tempStorage.hashPassword(newPassword);
        tempStorage.saveData();
        
        showSuccessMessage(languageManager.getText('passwordChanged'));
    }
}

function exportUserData() {
    const user = tempStorage.findUserByEmail(userData.email);
    if (user) {
        const exportData = {
            username: user.username,
            email: user.email,
            registrationDate: user.createdAt,
            lastLogin: user.lastLogin,
            gamesPlayed: user.gamesPlayed || 0,
            settings: settingsManager.settings,
            exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `ndn-store-data-${user.username}-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        showSuccessMessage(languageManager.getText('dataExported'));
    }
}

function showUserMenu() {
    if (userData.username && userData.email) {
        userName.textContent = userData.username;
        userEmail.textContent = userData.email;
        userMenu.style.display = 'block';
        
        // Добавляем кнопку "Профиль" в меню если её нет
        if (!document.getElementById('profileMenuBtn')) {
            const profileMenuBtn = document.createElement('button');
            profileMenuBtn.id = 'profileMenuBtn';
            profileMenuBtn.className = 'user-action-btn';
            profileMenuBtn.innerHTML = '<i class="fas fa-user-cog"></i> Профиль';
            profileMenuBtn.addEventListener('click', function() {
                hideUserMenu();
                showProfile();
            });
            userMenu.querySelector('.user-actions').insertBefore(profileMenuBtn, logoutBtn);
        }
    }
}

function hideUserMenu() {
    userMenu.style.display = 'none';
}

function showWelcomeMessage() {
    const message = document.createElement('div');
    message.className = 'welcome-message';
    message.innerHTML = `
        <div class="welcome-content">
            <h3>Добро пожаловать, ${userData.username}!</h3>
            <p>Вы успешно вошли в систему</p>
            <button class="btn btn-primary" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-check"></i>
                Продолжить
            </button>
        </div>
    `;
    
    document.body.appendChild(message);
    
    // Стили для сообщения
    message.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease-out;
    `;
    
    const welcomeContent = message.querySelector('.welcome-content');
    welcomeContent.style.cssText = `
        background: white;
        padding: 2rem;
        border-radius: 12px;
        text-align: center;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        animation: scaleIn 0.3s ease-out;
    `;
}

function showSuccessMessage() {
    const message = document.createElement('div');
    message.className = 'success-message';
    message.innerHTML = `
        <div class="success-content">
            <i class="fas fa-check-circle"></i>
            <h3>Регистрация успешна!</h3>
            <p>Добро пожаловать в NDN Store, ${userData.username}!</p>
        </div>
    `;
    
    document.body.appendChild(message);
    
    // Стили для сообщения
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        animation: slideInFromRight 0.5s ease-out;
    `;
    
    const successContent = message.querySelector('.success-content');
    successContent.style.cssText = `
        display: flex;
        align-items: center;
        gap: 0.75rem;
    `;
    
    successContent.querySelector('i').style.cssText = `
        font-size: 1.5rem;
    `;
    
    // Автоматически скрываем через 3 секунды
    setTimeout(() => {
        message.style.animation = 'slideOutToRight 0.5s ease-out';
        setTimeout(() => {
            message.remove();
        }, 500);
    }, 3000);
}

function showError(errorText) {
    const message = document.createElement('div');
    message.className = 'error-message';
    message.innerHTML = `
        <div class="error-content">
            <i class="fas fa-exclamation-triangle"></i>
            <span>${errorText}</span>
        </div>
    `;
    
    document.body.appendChild(message);
    
    // Стили для сообщения
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        animation: slideInFromRight 0.5s ease-out;
    `;
    
    const errorContent = message.querySelector('.error-content');
    errorContent.style.cssText = `
        display: flex;
        align-items: center;
        gap: 0.75rem;
    `;
    
    errorContent.querySelector('i').style.cssText = `
        font-size: 1.2rem;
    `;
    
    // Автоматически скрываем через 4 секунды
    setTimeout(() => {
        message.style.animation = 'slideOutToRight 0.5s ease-out';
        setTimeout(() => {
            message.remove();
        }, 500);
    }, 4000);
}

function showGameSelection() {
    const gameModal = document.createElement('div');
    gameModal.className = 'game-selection-modal';
    gameModal.innerHTML = `
        <div class="game-modal-content">
            <div class="game-modal-header">
                <h2>${languageManager.getText('selectGame')}</h2>
                <button class="close-modal" onclick="this.closest('.game-selection-modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="games-grid">
                <div class="game-card-modal" onclick="startGame('space')">
                    <i class="fas fa-rocket"></i>
                    <h3>${languageManager.getText('spaceAdventure')}</h3>
                    <p>${languageManager.getText('spaceAdventureDesc')}</p>
                </div>
                <div class="game-card-modal" onclick="startGame('medieval')">
                    <i class="fas fa-sword"></i>
                    <h3>${languageManager.getText('medievalQuest')}</h3>
                    <p>${languageManager.getText('medievalQuestDesc')}</p>
                </div>
                <div class="game-card-modal" onclick="startGame('racing')">
                    <i class="fas fa-car"></i>
                    <h3>${languageManager.getText('racingPro')}</h3>
                    <p>${languageManager.getText('racingProDesc')}</p>
                </div>
                <div class="game-card-modal" onclick="startGame('blast')">
                    <i class="fas fa-bomb"></i>
                    <h3>${languageManager.getText('blastThree')}</h3>
                    <p>${languageManager.getText('blastThreeDesc')}</p>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(gameModal);
    
    // Стили для модального окна
    gameModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease-out;
    `;
    
    const modalContent = gameModal.querySelector('.game-modal-content');
    modalContent.style.cssText = `
        background: white;
        padding: 2rem;
        border-radius: 12px;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        animation: scaleIn 0.3s ease-out;
    `;
}

// Глобальная функция для запуска игры
window.startGame = function(gameType) {
    const gameMessages = {
        space: '🚀 Запускаем Space Adventure! Приготовьтесь к космическим приключениям!',
        medieval: '⚔️ Запускаем Война рыцарей! Время рыцарских подвигов!',
        racing: '🏎️ Запускаем Racing Pro! Готовьтесь к гонкам!',
        blast: '💥 Запускаем Blast Three! Взрывная головоломка!'
    };
    
    const gameLinks = {
        space: 'https://yandex.ru/games/app/209729',
        medieval: 'https://yandex.ru/games/app/389452',
        racing: 'https://yandex.ru/games/app/449371?utm_source=game_promo_catalog&yclid=5907334997312012287',
        blast: 'https://nurel077.github.io/NDN_games/'
    };
    
    // Закрываем модальное окно
    document.querySelector('.game-selection-modal').remove();
    
    // Показываем сообщение о запуске игры
    const message = document.createElement('div');
    message.innerHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem;
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            animation: scaleIn 0.3s ease-out;
        ">
            <h3>${gameMessages[gameType]}</h3>
            <p>Перенаправляем на игру...</p>
        </div>
    `;
    document.body.appendChild(message);
    
    // Открываем игру в новой вкладке
    setTimeout(() => {
        window.open(gameLinks[gameType], '_blank');
        message.remove();
    }, 1500);
};

// Функции валидации
function validateUsername(username) {
    // Проверка длины
    if (username.length < 3) {
        showError(languageManager.getText('usernameMinLength'));
        return false;
    }
    
    if (username.length > 20) {
        showError(languageManager.getText('usernameMaxLength'));
        return false;
    }
    
    // Проверка на разрешенные символы (только буквы, цифры, подчеркивания)
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
        showError(languageManager.getText('usernameInvalidChars'));
        return false;
    }
    
    // Проверка на начало с буквы
    if (!/^[a-zA-Z]/.test(username)) {
        showError(languageManager.getText('usernameStartLetter'));
        return false;
    }
    
    return true;
}

function validateEmail(email) {
    // Проверка на пустоту
    if (!email) {
        showError(languageManager.getText('emailRequired'));
        return false;
    }
    
    // Проверка длины
    if (email.length > 254) {
        showError(languageManager.getText('emailTooLong'));
        return false;
    }
    
    // Регулярное выражение для проверки email
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!emailRegex.test(email)) {
        showError(languageManager.getText('emailInvalid'));
        return false;
    }
    
    // Дополнительные проверки
    const parts = email.split('@');
    if (parts.length !== 2) {
        showError(languageManager.getText('emailOneAt'));
        return false;
    }
    
    const [localPart, domainPart] = parts;
    
    // Проверка локальной части
    if (localPart.length === 0 || localPart.length > 64) {
        showError(languageManager.getText('emailLocalInvalid'));
        return false;
    }
    
    // Проверка доменной части
    if (domainPart.length === 0 || domainPart.length > 253) {
        showError(languageManager.getText('emailDomainInvalid'));
        return false;
    }
    
    // Проверка на точки в начале/конце
    if (localPart.startsWith('.') || localPart.endsWith('.')) {
        showError(languageManager.getText('emailStartEndDot'));
        return false;
    }
    
    // Проверка на двойные точки
    if (localPart.includes('..')) {
        showError(languageManager.getText('emailDoubleDot'));
        return false;
    }
    
    return true;
}

function validatePassword(password) {
    // Проверка длины
    if (password.length < 8) {
        showError(languageManager.getText('passwordMinLength'));
        return false;
    }
    
    if (password.length > 128) {
        showError(languageManager.getText('passwordMaxLength'));
        return false;
    }
    
    // Проверка на наличие заглавной буквы
    if (!/[A-Z]/.test(password)) {
        showError(languageManager.getText('passwordUppercase'));
        return false;
    }
    
    // Проверка на наличие строчной буквы
    if (!/[a-z]/.test(password)) {
        showError(languageManager.getText('passwordLowercase'));
        return false;
    }
    
    // Проверка на наличие цифры
    if (!/\d/.test(password)) {
        showError(languageManager.getText('passwordNumber'));
        return false;
    }
    
    // Проверка на наличие специального символа
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        showError(languageManager.getText('passwordSpecial'));
        return false;
    }
    
    // Проверка на пробелы
    if (/\s/.test(password)) {
        showError(languageManager.getText('passwordNoSpaces'));
        return false;
    }
    
    // Проверка на распространенные слабые пароли
    const commonPasswords = [
        'password', '123456', '123456789', 'qwerty', 'abc123',
        'password123', 'admin', 'letmein', 'welcome', 'monkey',
        '1234567890', 'password1', 'qwerty123', 'dragon', 'master'
    ];
    
    if (commonPasswords.includes(password.toLowerCase())) {
        showError(languageManager.getText('passwordCommon'));
        return false;
    }
    
    return true;
}

function isUserExists(email) {
    // В реальном приложении здесь была бы проверка базы данных
    // Для демонстрации проверяем localStorage
    const existingUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
    return existingUsers.some(user => user.email.toLowerCase() === email.toLowerCase());
}

function saveUserToDatabase(userData) {
    // Сохраняем пользователя в "базу данных" (localStorage)
    const allUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
    allUsers.push({
        ...userData,
        id: Date.now().toString(),
        passwordHash: hashPassword(userData.password), // В реальном приложении пароль хешируется
        createdAt: new Date().toISOString()
    });
    localStorage.setItem('allUsers', JSON.stringify(allUsers));
}

function hashPassword(password) {
    // Простая хеш-функция для демонстрации
    // В реальном приложении используйте bcrypt или подобные библиотеки
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
}

// Добавляем CSS анимации
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes scaleIn {
        from { transform: scale(0.8); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
    }
    
    @keyframes slideInFromRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutToRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .game-selection-modal .game-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 2px solid #e5e7eb;
    }
    
    .game-selection-modal .close-modal {
        background: none;
        border: none;
        font-size: 1.5rem;
        color: #6b7280;
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 50%;
        transition: all 0.3s ease;
    }
    
    .game-selection-modal .close-modal:hover {
        background: #f3f4f6;
        color: #374151;
    }
    
    .game-selection-modal .games-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
    }
    
    .game-selection-modal .game-card-modal {
        background: #f9fafb;
        padding: 1.5rem;
        border-radius: 12px;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s ease;
        border: 2px solid transparent;
    }
    
    .game-selection-modal .game-card-modal:hover {
        background: white;
        border-color: #6366f1;
        transform: translateY(-5px);
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    }
    
    .game-selection-modal .game-card-modal i {
        font-size: 2rem;
        color: #6366f1;
        margin-bottom: 1rem;
    }
    
    .game-selection-modal .game-card-modal h3 {
        font-size: 1.1rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
        color: #1f2937;
    }
    
    .game-selection-modal .game-card-modal p {
        font-size: 0.9rem;
        color: #6b7280;
    }
`;
document.head.appendChild(style);

// Система автоматического обновления при возврате с игры
class GameReturnManager {
    constructor() {
        this.gameWindow = null;
        this.isGameOpen = false;
        this.lastFocusTime = Date.now();
        this.init();
    }
    
    init() {
        // Отслеживаем открытие игр
        this.originalStartGame = window.startGame;
        window.startGame = (gameType) => {
            this.handleGameStart(gameType);
        };
        
        // Отслеживаем фокус окна
        window.addEventListener('focus', () => {
            this.handleWindowFocus();
        });
        
        // Отслеживаем потерю фокуса
        window.addEventListener('blur', () => {
            this.handleWindowBlur();
        });
        
        // Проверяем каждые 2 секунды, если окно было неактивно
        setInterval(() => {
            this.checkWindowActivity();
        }, 2000);
    }
    
    handleGameStart(gameType) {
        this.isGameOpen = true;
        this.lastFocusTime = Date.now();
        
        // Вызываем оригинальную функцию
        this.originalStartGame(gameType);
        
        // Отслеживаем открытие новой вкладки
        setTimeout(() => {
            this.checkForGameWindow();
        }, 2000);
    }
    
    checkForGameWindow() {
        // Проверяем, открыта ли игра в новой вкладке
        if (this.isGameOpen) {
            // Устанавливаем флаг для отслеживания возврата
            localStorage.setItem('gameOpened', 'true');
            localStorage.setItem('gameOpenTime', Date.now().toString());
        }
    }
    
    handleWindowFocus() {
        const now = Date.now();
        const timeSinceLastFocus = now - this.lastFocusTime;
        
        // Если прошло больше 5 секунд с последнего фокуса
        if (timeSinceLastFocus > 5000) {
            this.handleGameReturn();
        }
        
        this.lastFocusTime = now;
    }
    
    handleWindowBlur() {
        this.lastFocusTime = Date.now();
    }
    
    checkWindowActivity() {
        const gameOpened = localStorage.getItem('gameOpened') === 'true';
        const gameOpenTime = parseInt(localStorage.getItem('gameOpenTime') || '0');
        const now = Date.now();
        
        // Если игра была открыта и прошло больше 10 секунд
        if (gameOpened && (now - gameOpenTime) > 10000) {
            // Проверяем, активна ли текущая вкладка
            if (document.hasFocus()) {
                this.handleGameReturn();
            }
        }
    }
    
    handleGameReturn() {
        const gameOpened = localStorage.getItem('gameOpened') === 'true';
        
        if (gameOpened) {
            console.log('🎮 Обнаружен возврат с игры! Обновляем интерфейс...');
            
            // Очищаем флаги
            localStorage.removeItem('gameOpened');
            localStorage.removeItem('gameOpenTime');
            
            // Обновляем состояние сайта
            this.refreshSiteState();
            
            // Показываем уведомление о возврате
            this.showReturnNotification();
        }
    }
    
    refreshSiteState() {
        // Обновляем язык и тему
        if (languageManager) {
            languageManager.updateUI();
        }
        
        if (settingsManager) {
            settingsManager.applyTheme(settingsManager.settings.theme);
        }
        
        // Обновляем состояние пользователя
        if (isRegistered) {
            updateLoginButton();
        }
        
        // Обновляем профиль если он открыт
        if (profilePage && profilePage.style.display !== 'none') {
            updateProfileData();
        }
        
        // Очищаем любые открытые модальные окна
        const modals = document.querySelectorAll('.game-selection-modal, .logout-confirmation, .delete-confirmation');
        modals.forEach(modal => modal.remove());
        
        // Скрываем меню пользователя
        hideUserMenu();
        
        console.log('✅ Состояние сайта обновлено!');
    }
    
    showReturnNotification() {
        const notification = document.createElement('div');
        notification.className = 'return-notification';
        notification.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 12px;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                z-index: 10000;
                animation: slideInFromRight 0.5s ease-out;
                display: flex;
                align-items: center;
                gap: 0.75rem;
            ">
                <i class="fas fa-gamepad" style="font-size: 1.2rem;"></i>
                <span>Добро пожаловать обратно! Сайт обновлен.</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Автоматически скрываем через 3 секунды
        setTimeout(() => {
            notification.style.animation = 'slideOutToRight 0.5s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 500);
        }, 3000);
    }
}

// Инициализируем систему отслеживания возврата с игр
const gameReturnManager = new GameReturnManager();
