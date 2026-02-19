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
const deleteAccountMenuBtn = document.getElementById('deleteAccountMenuBtn');
const deleteAccountDangerBtn = document.getElementById('deleteAccountDangerBtn');

const STORAGE_PREFIX = 'kochmonOrdo_';
const LEGACY_STORAGE_PREFIX = 'ndnStore_';

function getStorageValue(key) {
    const newKey = `${STORAGE_PREFIX}${key}`;
    const legacyKey = `${LEGACY_STORAGE_PREFIX}${key}`;
    const newValue = localStorage.getItem(newKey);

    if (newValue !== null) {
        return newValue;
    }

    const legacyValue = localStorage.getItem(legacyKey);
    if (legacyValue !== null) {
        localStorage.setItem(newKey, legacyValue);
        return legacyValue;
    }

    return null;
}

function setStorageValue(key, value) {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, value);
}

function bindEvent(element, event, handler) {
    if (element) {
        element.addEventListener(event, handler);
    }
}

// Система временного storage
class TempStorage {
    constructor() {
        this.storageKey = `${STORAGE_PREFIX}tempData`;
        this.legacyStorageKey = `${LEGACY_STORAGE_PREFIX}tempData`;
        this.data = this.loadData();
    }
    
    loadData() {
        try {
            const migrated = this.migrateLegacyData();
            if (migrated) {
                return migrated;
            }

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
    
    migrateLegacyData() {
        const currentData = localStorage.getItem(this.storageKey);
        if (currentData) {
            return JSON.parse(currentData);
        }

        const legacyData = localStorage.getItem(this.legacyStorageKey);
        if (!legacyData) {
            return null;
        }

        localStorage.setItem(this.storageKey, legacyData);
        return JSON.parse(legacyData);
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
        this.currentLanguage = getStorageValue('language') || 'ky';
        const kyrgyzTranslations = {
            welcome: 'Оюн дүйнөсүнө кош келиңиз!',
            description: 'Кызыктуу оюндарды ачып, унутулгус таасир алыңыз',
            login: 'Кирүү',
            play: 'Ойной баштоо',
            profile: 'Профиль',
            register: 'Катталуу',
            username: 'Колдонуучу аты',
            email: 'Электрондук почта',
            password: 'Сырсөз',
            confirmPassword: 'Сырсөздү ырастаңыз',
            rememberMe: 'Мени эстеп кал',
            cancel: 'Жокко чыгаруу',
            continue: 'Улантуу',
            profileInfo: 'Профиль маалыматы',
            daysInSystem: 'системадагы күндөр',
            gamesPlayed: 'ойнолгон оюндар',
            lastLogin: 'акыркы кирүү',
            settings: 'Жөндөөлөр',
            language: 'Интерфейс тили',
            theme: 'Тема',
            light: 'Жарык',
            dark: 'Караңгы',
            auto: 'Авто',
            notifications: 'Билдирмелер',
            emailNotifications: 'Электрондук почта билдирмелери',
            gameNotifications: 'Оюн билдирмелери',
            newsNotifications: 'Жаңылыктар жана жаңыртуулар',
            accountManagement: 'Аккаунтту башкаруу',
            changeData: 'Маалыматты өзгөртүү',
            changeUsername: 'Колдонуучу атын өзгөртүү',
            changePassword: 'Сырсөздү өзгөртүү',
            exportData: 'Маалыматты экспорттоо',
            downloadData: 'Маалыматты жүктөп алуу',
            dangerZone: 'Кооптуу аймак',
            logout: 'Аккаунттан чыгуу',
            deleteAccount: 'Аккаунтту өчүрүү',
            back: 'Артка',
            registered: 'Катталган',
            games: 'Оюндар',
            aboutUs: 'Биз жөнүндө',
            contacts: 'Байланыш',
            loginTitle: 'Аккаунтка кирүү',
            registerTitle: 'Катталуу',
            enterPassword: 'Сырсөздү киргизиңиз',
            passwordRequirements: {
                length: 'Кеминде 8 белги',
                uppercase: 'Баш тамга',
                lowercase: 'Кичине тамга',
                number: 'Сан',
                special: 'Атайын белги'
            },
            passwordStrength: {
                weak: 'Алсыз сырсөз',
                fair: 'Орточо сырсөз',
                good: 'Жакшы сырсөз',
                strong: 'Күчтүү сырсөз'
            },
            passwordMatch: 'Сырсөздөр дал келди',
            passwordNoMatch: 'Сырсөздөр дал келген жок',
            fastDownload: 'Тез жүктөө',
            fastDownloadDesc: 'Оюндар заматта жүктөлөт',
            security: 'Коопсуздук',
            securityDesc: 'Коопсуз төлөмдөр',
            support247: '24/7 Колдоо',
            support247Desc: 'Ар дайым жардам беребиз',
            ndnStore: 'Көчмөн Ордо',
            bestGameStore: 'Мыкты оюн дүкөнү',
            followUs: 'Бизди ээрчиңиз',
            allRightsReserved: 'Бардык укуктар корголгон.',
            today: 'Бүгүн',
            daysAgo: 'күн мурун',
            userNotFound: 'Мындай email менен колдонуучу табылган жок!',
            wrongPassword: 'Сырсөз туура эмес!',
            passwordsNotMatch: 'Сырсөздөр дал келген жок!',
            userExists: 'Бул email менен колдонуучу мурунтан бар!',
            welcomeBack: 'Кайра кош келиңиз',
            welcomeToStore: 'Көчмөн Ордо платформасына кош келиңиз',
            registrationSuccess: 'Катталуу ийгиликтүү бүттү!',
            logoutSuccess: 'Аккаунттан ийгиликтүү чыктыңыз!',
            accountDeleted: 'Аккаунт ийгиликтүү өчүрүлдү!',
            usernameChanged: 'Колдонуучу аты ийгиликтүү өзгөртүлдү!',
            passwordChanged: 'Сырсөз ийгиликтүү өзгөртүлдү!',
            dataExported: 'Маалымат ийгиликтүү экспорттолду!',
            usernameMinLength: 'Колдонуучу аты кеминде 3 белгиден турушу керек!',
            usernameMaxLength: 'Колдонуучу аты 20 белгиден ашпашы керек!',
            usernameInvalidChars: 'Колдонуучу аты тамга, сан жана "_" гана камтышы керек!',
            usernameStartLetter: 'Колдонуучу аты тамга менен башталышы керек!',
            emailRequired: 'Email дареги милдеттүү!',
            emailTooLong: 'Email дареги өтө узун!',
            emailInvalid: 'Туура email дарегин киргизиңиз!',
            emailOneAt: 'Email дарегинде бир гана @ белгиси болушу керек!',
            emailLocalInvalid: 'Email дарегинин жергиликтүү бөлүгү туура эмес!',
            emailDomainInvalid: 'Email дарегинин домен бөлүгү туура эмес!',
            emailStartEndDot: 'Email чекит менен башталып же аяктабашы керек!',
            emailDoubleDot: 'Email ичинде кош чекит болбошу керек!',
            passwordMinLength: 'Сырсөз кеминде 8 белгиден турушу керек!',
            passwordMaxLength: 'Сырсөз 128 белгиден ашпашы керек!',
            passwordUppercase: 'Сырсөздө жок дегенде бир баш тамга болушу керек!',
            passwordLowercase: 'Сырсөздө жок дегенде бир кичине тамга болушу керек!',
            passwordNumber: 'Сырсөздө жок дегенде бир сан болушу керек!',
            passwordSpecial: 'Сырсөздө жок дегенде бир атайын белги болушу керек!',
            passwordNoSpaces: 'Сырсөздө боштук болбошу керек!',
            passwordCommon: 'Бул сырсөз өтө кеңири колдонулат. Татаалыраак сырсөз тандаңыз!',
            selectGame: 'Оюнду тандаңыз',
            kochmonOrnoku: 'Көчмөн Орноку',
            kochmonOrnokuDesc: 'Улуттук рухтагы оюн',
            flappyBird: 'Канаттуу куш',
            flappyBirdDesc: 'Классикалык аркада учуу оюну',
            kochmonLoading: 'Көчмөн Орноку ачылып жатат!',
            flappyLoading: 'Канаттуу куш ачылып жатат!',
            gameLoading: 'Оюн ачылып жатат...',
            logoutConfirm: 'Аккаунттан чыгасызбы?',
            logoutConfirmText: 'Аккаунттан чыгууга ишенесизби?',
            yesLogout: 'Ооба, чыгам',
            deleteAccountConfirm: 'Аккаунтту өчүрөсүзбү?',
            deleteAccountText: 'Бул аракет артка кайтарылбайт! Бардык маалыматыңыз өчүрүлөт.',
            deleteAccountWarning: 'Эскертүү: бардык оюндарга жана маалыматка жетүү жоголот.',
            yesDelete: 'Ооба, өчүрүү',
            enterCurrentPassword: 'Учурдагы сырсөздү киргизиңиз:',
            enterNewPassword: 'Жаңы сырсөздү киргизиңиз:',
            wrongCurrentPassword: 'Учурдагы сырсөз туура эмес!',
            returnFromGame: 'Кайра кош келиңиз! Сайт жаңыртылды.'
        };
        this.translations = {
            ky: kyrgyzTranslations,
            ru: kyrgyzTranslations,
            en: kyrgyzTranslations
        };
    }
    
    setLanguage(lang) {
        this.currentLanguage = lang;
        setStorageValue('language', lang);
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
            language: getStorageValue('language') || 'ky',
            theme: getStorageValue('theme') || 'light',
            notifications: {
                email: getStorageValue('emailNotifications') !== 'false',
                games: getStorageValue('gameNotifications') !== 'false',
                news: getStorageValue('newsNotifications') === 'true'
            }
        };
    }
    
    saveSettings() {
        setStorageValue('language', this.settings.language);
        setStorageValue('theme', this.settings.theme);
        setStorageValue('emailNotifications', this.settings.notifications.email);
        setStorageValue('gameNotifications', this.settings.notifications.games);
        setStorageValue('newsNotifications', this.settings.notifications.news);
    }
    
    applyTheme(theme) {
        this.settings.theme = theme;
        document.body.classList.remove('theme-light', 'theme-dark', 'theme-auto');
        document.body.classList.add(`theme-${theme}`);
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
console.log('Көчмөн Ордо - storage маалыматы:', tempStorage.getStorageInfo());

// Обработчик клика на кнопку "Войти"
bindEvent(loginBtn, 'click', function() {
    // Показываем формы входа/регистрации только для неавторизованных пользователей
    showAuthForms();
});

// Обработчики табов
bindEvent(loginTab, 'click', function() {
    switchToLoginTab();
});

bindEvent(registerTab, 'click', function() {
    switchToRegisterTab();
});

// Обработчик формы входа
bindEvent(loginFormElement, 'submit', function(e) {
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
bindEvent(cancelLogin, 'click', function() {
    hideAuthForms();
});

// Закрытие меню при клике вне его
document.addEventListener('click', function(e) {
    if (isRegistered && !loginBtn.contains(e.target) && !userMenu.contains(e.target) && !userMenuBtn.contains(e.target)) {
        hideUserMenu();
    }
});

// Обработчик кнопки "Отмена" для регистрации
bindEvent(cancelReg, 'click', function() {
    hideAuthForms();
});

// Обработчик отправки формы регистрации
bindEvent(regForm, 'submit', function(e) {
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
bindEvent(playBtn, 'click', function() {
    showGameSelection();
});

// Обработчик клика на кнопку "Профиль"
bindEvent(profileBtn, 'click', function() {
    showProfile();
});

// Обработчик клика на кнопку меню пользователя
bindEvent(userMenuBtn, 'click', function() {
    // Переключаем видимость меню пользователя
    if (userMenu.style.display === 'block') {
        hideUserMenu();
    } else {
        showUserMenu();
    }
});

// Обработчик кнопки "Назад" в профиле
bindEvent(backToMainBtn, 'click', function() {
    hideProfile();
});

// Обработчики табов профиля
bindEvent(profileTab, 'click', function() {
    switchProfileTab('profile');
});

bindEvent(settingsTab, 'click', function() {
    switchProfileTab('settings');
});

bindEvent(accountTab, 'click', function() {
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
const emailNotificationsInput = document.getElementById('emailNotifications');
const gameNotificationsInput = document.getElementById('gameNotifications');
const newsNotificationsInput = document.getElementById('newsNotifications');

bindEvent(emailNotificationsInput, 'change', function() {
    settingsManager.settings.notifications.email = this.checked;
    settingsManager.saveSettings();
});

bindEvent(gameNotificationsInput, 'change', function() {
    settingsManager.settings.notifications.games = this.checked;
    settingsManager.saveSettings();
});

bindEvent(newsNotificationsInput, 'change', function() {
    settingsManager.settings.notifications.news = this.checked;
    settingsManager.saveSettings();
});

// Обработчики управления аккаунтом
bindEvent(changeUsernameBtn, 'click', function() {
    showChangeUsernameDialog();
});

bindEvent(changePasswordBtn, 'click', function() {
    showChangePasswordDialog();
});

bindEvent(exportDataBtn, 'click', function() {
    exportUserData();
});

bindEvent(logoutAccountBtn, 'click', function() {
    logout();
});

bindEvent(deleteAccountDangerBtn, 'click', function() {
    showDeleteConfirmation();
});

// Обработчик клика на кнопку "Выйти"
bindEvent(logoutBtn, 'click', function() {
    logout();
});

// Обработчик клика на кнопку "Удалить аккаунт"
bindEvent(deleteAccountMenuBtn, 'click', function() {
    showDeleteConfirmation();
});

// Функции выхода и удаления
function createConfirmationModal(options) {
    const {
        modalClass,
        title,
        description,
        confirmText,
        confirmButtonClass = 'btn-primary',
        confirmIconClass = 'fas fa-check',
        warningText = '',
        warningIconClass = '',
        onConfirm
    } = options;

    document.querySelectorAll('.logout-confirmation, .delete-confirmation').forEach(modal => modal.remove());

    const message = document.createElement('div');
    message.className = modalClass;
    message.innerHTML = `
        <div class="confirmation-content">
            ${warningIconClass ? `<div class="warning-icon"><i class="${warningIconClass}"></i></div>` : ''}
            <h3>${title}</h3>
            <p>${description}</p>
            ${warningText ? `<div class="warning-text"><strong>${warningText}</strong></div>` : ''}
            <div class="confirmation-buttons">
                <button class="btn ${confirmButtonClass} confirm-action-btn">
                    <i class="${confirmIconClass}"></i>
                    ${confirmText}
                </button>
                <button class="btn btn-secondary cancel-action-btn">
                    <i class="fas fa-times"></i>
                    ${languageManager.getText('cancel')}
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(message);

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
    if (warningIcon) {
        warningIcon.style.cssText = `
            font-size: 3rem;
            color: #ef4444;
            margin-bottom: 1rem;
        `;
    }

    const warningBox = message.querySelector('.warning-text');
    if (warningBox) {
        warningBox.style.cssText = `
            background: #fef2f2;
            color: #dc2626;
            padding: 1rem;
            border-radius: 8px;
            margin: 1rem 0;
            border: 1px solid #fecaca;
        `;
    }

    const confirmationButtons = message.querySelector('.confirmation-buttons');
    confirmationButtons.style.cssText = `
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin-top: 1.5rem;
    `;

    bindEvent(message.querySelector('.cancel-action-btn'), 'click', function() {
        message.remove();
    });

    bindEvent(message, 'click', function(event) {
        if (event.target === message) {
            message.remove();
        }
    });

    bindEvent(message.querySelector('.confirm-action-btn'), 'click', function() {
        if (typeof onConfirm === 'function') {
            onConfirm();
        }
        message.remove();
    });
}

function logout() {
    createConfirmationModal({
        modalClass: 'logout-confirmation',
        title: languageManager.getText('logoutConfirm'),
        description: languageManager.getText('logoutConfirmText'),
        confirmText: languageManager.getText('yesLogout'),
        confirmButtonClass: 'btn-primary',
        confirmIconClass: 'fas fa-sign-out-alt',
        onConfirm: performLogout
    });
}

function performLogout() {
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

    // Показываем сообщение
    showSuccessMessage(languageManager.getText('logoutSuccess'));
}

function showDeleteConfirmation() {
    createConfirmationModal({
        modalClass: 'delete-confirmation',
        title: languageManager.getText('deleteAccountConfirm'),
        description: languageManager.getText('deleteAccountText'),
        confirmText: languageManager.getText('yesDelete'),
        confirmButtonClass: 'btn-danger',
        confirmIconClass: 'fas fa-trash',
        warningText: languageManager.getText('deleteAccountWarning'),
        warningIconClass: 'fas fa-exclamation-triangle',
        onConfirm: performDeleteAccount
    });
}

function performDeleteAccount() {
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

    // Показываем сообщение
    showSuccessMessage(languageManager.getText('accountDeleted'));
}

// Интерактивные индикаторы пароля
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const passwordRequirements = document.getElementById('passwordRequirements');
const passwordMatch = document.getElementById('passwordMatch');

// Обработчик ввода пароля
bindEvent(passwordInput, 'input', function() {
    const password = this.value;
    updatePasswordStrength(password);
    updatePasswordRequirements(password);
    
    // Проверяем совпадение паролей, если поле подтверждения заполнено
    if (confirmPasswordInput && confirmPasswordInput.value) {
        checkPasswordMatch();
    }
});

// Обработчик ввода подтверждения пароля
bindEvent(confirmPasswordInput, 'input', function() {
    checkPasswordMatch();
});

function updatePasswordStrength(password) {
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');
    if (!strengthFill || !strengthText) return;
    
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
    if (!passwordRequirements) return;

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
        if (!element) return;
        if (requirements[reqId]) {
            element.classList.add('valid');
        } else {
            element.classList.remove('valid');
        }
    });
}

function checkPasswordMatch() {
    if (!passwordInput || !confirmPasswordInput || !passwordMatch) return;

    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    if (confirmPassword.length === 0) {
        passwordMatch.classList.remove('show');
        return;
    }
    
    passwordMatch.classList.add('show');
    
    if (password === confirmPassword) {
        passwordMatch.className = 'password-match show match';
        passwordMatch.textContent = languageManager ? languageManager.getText('passwordMatch') : 'Сырсөздөр дал келди';
    } else {
        passwordMatch.className = 'password-match show no-match';
        passwordMatch.textContent = languageManager ? languageManager.getText('passwordNoMatch') : 'Сырсөздөр дал келген жок';
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

function createInfoModal(title, description) {
    const existingModal = document.querySelector('.info-modal');
    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.className = 'info-modal';
    modal.innerHTML = `
        <div class="info-modal-content">
            <h3>${title}</h3>
            <p>${description}</p>
            <button class="btn btn-primary close-info-modal-btn">
                <i class="fas fa-check"></i>
                ${languageManager.getText('continue')}
            </button>
        </div>
    `;

    document.body.appendChild(modal);

    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease-out;
        padding: 1rem;
    `;

    const modalContent = modal.querySelector('.info-modal-content');
    modalContent.style.cssText = `
        background: white;
        border-radius: 12px;
        padding: 2rem;
        max-width: 520px;
        width: 100%;
        text-align: center;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15);
        animation: scaleIn 0.3s ease-out;
    `;

    bindEvent(modal.querySelector('.close-info-modal-btn'), 'click', function() {
        modal.remove();
    });

    bindEvent(modal, 'click', function(event) {
        if (event.target === modal) {
            modal.remove();
        }
    });
}

function showAboutModal() {
    createInfoModal(
        'Көчмөн Ордо',
        'Көчмөн Ордо - кыргыз оюн дүкөнү. Катталып, профилди башкара аласыз жана оюндарды бир чыкылдатуу менен иштете аласыз.'
    );
}

function showContactsModal() {
    createInfoModal(
        'Байланыш',
        'Суроолор үчүн бизге жазыңыз: support@kochmon-ordo.kg. Биз 24/7 жардам беребиз.'
    );
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
        link.download = `kochmon-ordo-data-${user.username}-${new Date().toISOString().split('T')[0]}.json`;
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
            profileMenuBtn.innerHTML = `<i class="fas fa-user-cog"></i> ${languageManager.getText('profile')}`;
            bindEvent(profileMenuBtn, 'click', function() {
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
            <h3>Кош келиңиз, ${userData.username}!</h3>
            <p>Системага ийгиликтүү кирдиңиз</p>
            <button class="btn btn-primary" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-check"></i>
                Улантуу
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

function showSuccessMessage(successText) {
    const message = document.createElement('div');
    message.className = 'success-message';
    message.innerHTML = `
        <div class="success-content">
            <i class="fas fa-check-circle"></i>
            <h3>${successText || languageManager.getText('registrationSuccess')}</h3>
        </div>
    `;
    
    document.body.appendChild(message);
    
    // Стили для сообщения
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #8c3f21 0%, #c79a42 100%);
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
                <div class="game-card-modal" onclick="startGame('kochmon')">
                    <i class="fas fa-horse"></i>
                    <h3>${languageManager.getText('kochmonOrnoku')}</h3>
                    <p>${languageManager.getText('kochmonOrnokuDesc')}</p>
                </div>
                <div class="game-card-modal" onclick="startGame('flappy')">
                    <i class="fas fa-dove"></i>
                    <h3>${languageManager.getText('flappyBird')}</h3>
                    <p>${languageManager.getText('flappyBirdDesc')}</p>
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
        kochmon: languageManager.getText('kochmonLoading'),
        flappy: languageManager.getText('flappyLoading')
    };
    
    const gameLinks = {
        kochmon: 'https://nurel077.github.io/NDN_games/',
        flappy: 'https://nurel077.github.io/flappy_bird/'
    };

    if (!gameLinks[gameType]) {
        showError('Бул оюн азырынча жеткиликтүү эмес.');
        return;
    }
    
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
            background: linear-gradient(135deg, #8c3f21 0%, #c79a42 100%);
            color: white;
            padding: 2rem;
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            animation: scaleIn 0.3s ease-out;
        ">
            <h3>${gameMessages[gameType]}</h3>
            <p>${languageManager.getText('gameLoading')}</p>
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
        border-color: #8c3f21;
        transform: translateY(-5px);
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    }
    
    .game-selection-modal .game-card-modal i {
        font-size: 2rem;
        color: #8c3f21;
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
                background: linear-gradient(135deg, #8c3f21 0%, #c79a42 100%);
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
                <span>${languageManager.getText('returnFromGame')}</span>
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





