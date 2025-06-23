document.addEventListener('DOMContentLoaded', () => {
    // --- Отримання посилань на HTML-елементи ---
    const authContainer = document.getElementById('authContainer');
    const registerSection = document.getElementById('register-section');
    const loginSection = document.getElementById('login-section');

    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');

    const showLoginLink = document.getElementById('showLogin');
    const showRegisterLink = document.getElementById('showRegister');

    // Елементи для основного дашборду
    const dashboardSection = document.getElementById('dashboardSection');
    const twitchDashboardLink = document.getElementById('twitchDashboardLink');
    const tiktokDashboardLink = document.getElementById('tiktokDashboardLink');

    // Елементи для секції Twitch-каналів
    const twitchChannelsSection = document.getElementById('twitchChannelsSection');
    const backToDashboardFromTwitchBtn = document.getElementById('backToDashboardFromTwitchBtn');

    // Елементи для секції TikTok-каналів
    const tiktokChannelsSection = document.getElementById('tiktokChannelsSection');
    const backToDashboardFromTikTokBtn = document.getElementById('backToDashboardFromTikTokBtn');

    // Нові елементи для Профілю
    const profileIconContainer = document.getElementById('profileIconContainer');
    const headerProfileIcon = document.getElementById('headerProfileIcon');
    const profileSection = document.getElementById('profileSection');
    const closeProfileBtn = document.getElementById('closeProfileBtn');
    const profileForm = document.getElementById('profileForm');
    const profileUsernameInput = document.getElementById('profileUsername');
    const profileNicknameInput = document.getElementById('profileNickname'); // Додано нікнейм
    const newPasswordInput = document.getElementById('newPassword');
    const profileAvatar = document.getElementById('profileAvatar');
    const avatarUpload = document.getElementById('avatarUpload');
    const logoutFromProfileBtn = document.getElementById('logoutFromProfileBtn');

    // Елементи для улюблених каналів
    const favoriteChannelsContainer = document.getElementById('favoriteChannelsContainer');
    const noFavoritesMessage = document.getElementById('noFavoritesMessage');

    // Елемент для відображення імені користувача на дашборді
    const loggedInUsernameSpan = document.getElementById('loggedInUsername');


    // Змінна для зберігання оригінального логіну користувача при відкритті профілю
    let originalUsername = '';

    // --- Функції для роботи з localStorage ---
    function getStoredUsers() {
        const usersJSON = localStorage.getItem('registeredUsers');
        return usersJSON ? JSON.parse(usersJSON) : {};
    }

    function storeUsers(users) {
        localStorage.setItem('registeredUsers', JSON.stringify(users));
    }

    function getStoredUserProfiles() {
        const profilesJSON = localStorage.getItem('userProfiles');
        return profilesJSON ? JSON.parse(profilesJSON) : {};
    }

    function storeUserProfiles(profiles) {
        localStorage.setItem('userProfiles', JSON.stringify(profiles));
    }

    function setCurrentLoggedInUser(username) {
        localStorage.setItem('currentLoggedInUser', username);
        console.log(`Користувач '${username}' встановлений як поточний.`);
        updateHeaderProfileIcon(); // Оновити іконку профілю в хедері
        updateLoggedInUsernameDisplay(); // Оновити відображуване ім'я
    }

    function getCurrentLoggedInUser() {
        return localStorage.getItem('currentLoggedInUser');
    }

    function removeCurrentLoggedInUser() {
        localStorage.removeItem('currentLoggedInUser');
        console.log('Поточний користувач видалений з localStorage.');
        updateHeaderProfileIcon(); // Оновити іконку профілю в хедері (повернути дефолтний)
        updateLoggedInUsernameDisplay(); // Очистити відображуване ім'я
    }

    // Зберігання та отримання даних профілю (включаючи фото, нікнейм, улюблені)
    function saveUserProfile(username, data) {
        let profiles = getStoredUserProfiles();
        profiles[username] = data;
        storeUserProfiles(profiles);
        console.log(`Профіль для '${username}' збережено.`);
        updateHeaderProfileIcon(); // Оновити іконку профілю в хедері після збереження
        updateLoggedInUsernameDisplay(); // Оновити відображуване ім'я після збереження
    }

    function getUserProfile(username) {
        let profiles = getStoredUserProfiles();
        // Додано 'nickname' та 'favorites' до дефолтного об'єкта
        return profiles[username] || { avatar: 'default_avatar.png', nickname: '', favorites: [] };
    }

    // --- Функції для роботи з улюбленими каналами ---
    function getUserFavorites(username) {
        const userProfile = getUserProfile(username);
        return userProfile.favorites || [];
    }

    function saveUserFavorites(username, favorites) {
        let profiles = getStoredUserProfiles();
        if (!profiles[username]) {
            profiles[username] = { avatar: 'default_avatar.png', nickname: '', favorites: [] }; // Ініціалізуємо
        }
        profiles[username].favorites = favorites;
        storeUserProfiles(profiles);
        renderFavoriteChannels(); // Оновити відображення улюблених після збереження
    }

    function addFavoriteChannel(channel) {
        const currentUser = getCurrentLoggedInUser();
        if (currentUser) {
            let favorites = getUserFavorites(currentUser);
            if (!favorites.some(fav => fav.url === channel.url)) {
                favorites.push(channel);
                saveUserFavorites(currentUser, favorites);
            }
            updateFavoriteButtonsState();
        } else {
            alert('Будь ласка, увійдіть, щоб додавати канали до улюблених.');
        }
    }

    function removeFavoriteChannel(urlToRemove) {
        const currentUser = getCurrentLoggedInUser();
        if (currentUser) {
            let favorites = getUserFavorites(currentUser);
            favorites = favorites.filter(fav => fav.url !== urlToRemove);
            saveUserFavorites(currentUser, favorites);
            updateFavoriteButtonsState();
        }
    }

    function renderFavoriteChannels() {
        const currentUser = getCurrentLoggedInUser();
        favoriteChannelsContainer.innerHTML = '';
        if (currentUser) {
            const favorites = getUserFavorites(currentUser);
            if (favorites.length === 0) {
                noFavoritesMessage.style.display = 'block';
            } else {
                noFavoritesMessage.style.display = 'none';
                favorites.forEach(channel => {
                    const channelItem = document.createElement('div');
                    channelItem.classList.add('channel-item');

                    const link = document.createElement('a');
                    link.href = channel.url;
                    link.target = '_blank';
                    link.classList.add('btn', 'channel-btn');
                    if (channel.platform === 'twitch') {
                        link.classList.add('twitch-channel-btn');
                    } else if (channel.platform === 'tiktok') {
                        link.classList.add('tiktok-channel-btn');
                    }
                    link.textContent = channel.name;

                    const removeBtn = document.createElement('button');
                    removeBtn.classList.add('add-to-favorites-btn', 'favorite');
                    removeBtn.innerHTML = '<i class="fa-solid fa-star"></i>';
                    removeBtn.title = 'Видалити з улюблених';
                    removeBtn.addEventListener('click', () => removeFavoriteChannel(channel.url));

                    channelItem.appendChild(link);
                    channelItem.appendChild(removeBtn);
                    favoriteChannelsContainer.appendChild(channelItem);
                });
            }
        } else {
            noFavoritesMessage.style.display = 'block';
        }
    }

    function updateFavoriteButtonsState() {
        const currentUser = getCurrentLoggedInUser();
        if (!currentUser) {
            document.querySelectorAll('.add-to-favorites-btn').forEach(button => {
                button.classList.remove('favorite');
                button.innerHTML = '<i class="fa-regular fa-star"></i>';
                button.title = 'Додати в улюблене';
            });
            return;
        }

        const favorites = getUserFavorites(currentUser);
        const allAddFavoriteButtons = document.querySelectorAll('.add-to-favorites-btn');

        allAddFavoriteButtons.forEach(button => {
            const channelUrl = button.dataset.url;
            if (favorites.some(fav => fav.url === channelUrl)) {
                button.classList.add('favorite');
                button.innerHTML = '<i class="fa-solid fa-star"></i>';
                button.title = 'В улюблених';
            } else {
                button.classList.remove('favorite');
                button.innerHTML = '<i class="fa-regular fa-star"></i>';
                button.title = 'Додати в улюблене';
            }
        });
    }

    // --- Функція для хешування паролів (SHA-256) ---
    async function hashPassword(password) {
        const textEncoder = new TextEncoder();
        const data = textEncoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashedPassword = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashedPassword;
    }

    // --- Функції для управління інтерфейсом ---
    function showContent(contentType) {
        console.log(`Показати контент: ${contentType}`);

        // Приховуємо всі можливі секції
        authContainer.style.display = 'none';
        registerSection.style.display = 'none';
        loginSection.style.display = 'none';
        dashboardSection.style.display = 'none';
        twitchChannelsSection.style.display = 'none';
        tiktokChannelsSection.style.display = 'none';
        profileSection.style.display = 'none';

        // Керування видимістю іконки профілю
        const loggedIn = getCurrentLoggedInUser();
        if (loggedIn && (contentType === 'dashboard' || contentType === 'twitch_channels' || contentType === 'tiktok_channels' || contentType === 'profile')) {
            profileIconContainer.style.display = 'block';
        } else {
            profileIconContainer.style.display = 'none';
        }

        // Відображаємо потрібну секцію
        if (contentType === 'register') {
            authContainer.style.display = 'block';
            registerSection.style.display = 'block';
        } else if (contentType === 'login') {
            authContainer.style.display = 'block';
            loginSection.style.display = 'block';
        } else if (contentType === 'dashboard') {
            dashboardSection.style.display = 'block';
            renderFavoriteChannels(); // Оновлюємо список улюблених при відкритті дашборда
            updateFavoriteButtonsState(); // Оновлюємо стан кнопок зірочок
            updateLoggedInUsernameDisplay(); // Оновлюємо відображуване ім'я
        } else if (contentType === 'twitch_channels') {
            twitchChannelsSection.style.display = 'block';
            updateFavoriteButtonsState(); // Оновлюємо стан кнопок зірочок
        } else if (contentType === 'tiktok_channels') {
            tiktokChannelsSection.style.display = 'block';
            updateFavoriteButtonsState(); // Оновлюємо стан кнопок зірочок
        } else if (contentType === 'profile') {
            profileSection.style.display = 'block';
            loadProfileData(); // Завантажуємо дані профілю при відкритті
        }
    }

    // Функція для завантаження даних профілю у форму профілю
    function loadProfileData() {
        console.log('Завантаження даних профілю у форму.');
        const currentUser = getCurrentLoggedInUser();
        if (currentUser) {
            originalUsername = currentUser; // Зберігаємо оригінальний логін
            profileUsernameInput.value = currentUser;
            const userProfile = getUserProfile(currentUser);
            profileAvatar.src = userProfile.avatar || 'default_avatar.png'; // Встановлюємо аватар у формі профілю
            profileNicknameInput.value = userProfile.nickname || ''; // Встановлюємо нікнейм у формі профілю
            console.log(`Дані профілю для '${currentUser}' завантажено. Аватар: ${profileAvatar.src}, Нікнейм: ${profileNicknameInput.value}`);
        } else {
            console.log('Немає поточного користувача для завантаження профілю.');
            profileUsernameInput.value = '';
            profileNicknameInput.value = '';
            profileAvatar.src = 'default_avatar.png';
            originalUsername = '';
        }
        newPasswordInput.value = ''; // Очищаємо поле нового пароля

        // Скидаємо іконки "ока" на початковий стан (перекреслене око, тип password)
        document.querySelectorAll('.toggle-password').forEach(icon => {
            const targetId = icon.dataset.target;
            const targetInput = document.getElementById(targetId);
            if (targetInput) {
                targetInput.type = 'password';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            }
        });
    }

    // Функція для оновлення аватарки в хедері
    function updateHeaderProfileIcon() {
        const currentUser = getCurrentLoggedInUser();
        if (currentUser) {
            const userProfile = getUserProfile(currentUser);
            headerProfileIcon.src = userProfile.avatar || 'default_avatar.png'; // Встановлюємо аватар в хедері
            console.log(`Аватар в хедері оновлено для '${currentUser}'.`);
        } else {
            headerProfileIcon.src = 'default_avatar.png'; // Якщо немає користувача, ставимо дефолтний
            console.log('Аватар в хедері встановлено на дефолтний (користувач не увійшов).');
        }
    }

    // Функція для оновлення відображуваного імені користувача (логін або нікнейм)
    function updateLoggedInUsernameDisplay() {
        const currentUser = getCurrentLoggedInUser();
        if (currentUser) {
            const userProfile = getUserProfile(currentUser);
            // Відображаємо нікнейм, якщо він є, інакше - логін
            loggedInUsernameSpan.textContent = userProfile.nickname || currentUser;
        } else {
            loggedInUsernameSpan.textContent = ''; // Очищаємо, якщо користувач не увійшов
        }
    }

    // --- Функція для перемикання видимості пароля ---
    function togglePasswordVisibility(event) {
        const icon = event.target;
        const targetInputId = icon.dataset.target;
        const targetInput = document.getElementById(targetInputId);

        if (targetInput) {
            if (targetInput.type === 'password') {
                targetInput.type = 'text';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            } else {
                targetInput.type = 'password';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            }
        }
    }

    // --- Ініціалізація сторінки ---
    const previouslyLoggedInUser = getCurrentLoggedInUser();
    if (previouslyLoggedInUser) {
        showContent('dashboard');
        updateHeaderProfileIcon();
        updateLoggedInUsernameDisplay(); // Викликаємо при ініціалізації
        console.log(`Користувач '${previouslyLoggedInUser}' був авторизований раніше. Показано дашборд.`);
    } else {
        showContent('login');
        updateHeaderProfileIcon();
        updateLoggedInUsernameDisplay();
        console.log('Користувач не авторизований. Показано форму входу.');
    }

    // --- Обробники подій для форм та кнопок ---

    // Реєстрація
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const regUsername = document.getElementById('regUsername').value.trim();
        const regPassword = document.getElementById('regPassword').value;

        if (!regUsername || !regPassword) {
            alert('Будь ласка, заповніть усі поля!');
            return;
        }

        let users = getStoredUsers();
        if (users[regUsername]) {
            alert('Користувач з таким логіном вже існує! Будь ласка, виберіть інший.');
        } else {
            const hashedPassword = await hashPassword(regPassword);
            users[regUsername] = hashedPassword;
            storeUsers(users);
            // Ініціалізуємо профіль для нового користувача, включаючи порожній нікнейм та favorites
            saveUserProfile(regUsername, { avatar: 'default_avatar.png', nickname: '', favorites: [] });

            alert('Реєстрація успішна! Тепер ви можете увійти.');
            setCurrentLoggedInUser(regUsername); // Встановлюємо як поточного одразу після реєстрації
            showContent('dashboard');
        }
        registerForm.reset();
        document.getElementById('regPassword').type = 'password';
        document.querySelector('#registerForm .toggle-password').classList.remove('fa-eye');
        document.querySelector('#registerForm .toggle-password').classList.add('fa-eye-slash');
    });

    // Вхід
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const loginUsername = document.getElementById('loginUsername').value.trim();
        const loginPassword = document.getElementById('loginPassword').value;

        if (!loginUsername || !loginPassword) {
            alert('Будь ласка, заповніть усі поля!');
            return;
        }

        let users = getStoredUsers();
        const storedHashedPassword = users[loginUsername];

        if (storedHashedPassword) {
            const enteredHashedPassword = await hashPassword(loginPassword);
            if (enteredHashedPassword === storedHashedPassword) {
                alert('Вхід успішний!');
                setCurrentLoggedInUser(loginUsername);
                showContent('dashboard');
            } else {
                alert('Неправильний логін або пароль. Спробуйте ще раз.');
            }
        } else {
            alert('Неправильний логін або пароль. Спробуйте ще раз.');
        }
        loginForm.reset();
        document.getElementById('loginPassword').type = 'password';
        document.querySelector('#loginForm .toggle-password').classList.remove('fa-eye');
        document.querySelector('#loginForm .toggle-password').classList.add('fa-eye-slash');
    });

    // Перемикання між формами реєстрації та входу
    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        showContent('login');
    });

    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        showContent('register');
    });

    // Навігація дашборда
    twitchDashboardLink.addEventListener('click', (e) => {
        e.preventDefault();
        showContent('twitch_channels');
    });

    backToDashboardFromTwitchBtn.addEventListener('click', () => {
        showContent('dashboard');
    });

    tiktokDashboardLink.addEventListener('click', (e) => {
        e.preventDefault();
        showContent('tiktok_channels');
    });

    backToDashboardFromTikTokBtn.addEventListener('click', () => {
        showContent('dashboard');
    });

    // Обробники для кнопок "Додати в улюблене" (використовуємо делегування подій)
    document.addEventListener('click', (e) => {
        if (e.target.closest('.add-to-favorites-btn')) {
            const button = e.target.closest('.add-to-favorites-btn');
            const platform = button.dataset.platform;
            const name = button.dataset.name;
            const url = button.dataset.url;

            const currentUser = getCurrentLoggedInUser();
            if (!currentUser) {
                alert('Будь ласка, увійдіть, щоб керувати улюбленими каналами.');
                return;
            }

            let favorites = getUserFavorites(currentUser);
            const channelExists = favorites.some(fav => fav.url === url);

            if (channelExists) {
                removeFavoriteChannel(url);
            } else {
                addFavoriteChannel({ platform, name, url });
            }
        }
    });


    // --- Логіка профілю ---

    // Відкриття профілю при кліку на іконку
    profileIconContainer.addEventListener('click', () => {
        console.log('Клік по іконці профілю.');
        const currentUser = getCurrentLoggedInUser();
        if (currentUser) {
            showContent('profile');
        } else {
            alert('Будь ласка, увійдіть, щоб переглянути профіль.');
            showContent('login');
        }
    });

    // Закриття профілю
    closeProfileBtn.addEventListener('click', () => {
        console.log('Клік по кнопці закриття профілю.');
        showContent('dashboard'); // Повертаємо на дашборд при закритті профілю
    });

    // Зміна фото профілю
    avatarUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                profileAvatar.src = event.target.result; // Оновлюємо аватар у формі профілю
                console.log(`Новий аватар вибрано: ${profileAvatar.src}`);
            };
            reader.readAsDataURL(file);
        }
    });

    // Обробка форми профілю (зміна логіну, нікнейму, пароля, аватара)
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Відправлення форми профілю.');

        const currentUser = getCurrentLoggedInUser();
        if (!currentUser) {
            alert('Користувач не авторизований.');
            return;
        }

        const newUsername = profileUsernameInput.value.trim();
        const newNickname = profileNicknameInput.value.trim(); // Отримуємо значення нікнейму
        const newPassword = newPasswordInput.value;
        let changesMade = false;

        let userProfile = getUserProfile(currentUser); // Отримуємо поточні дані профілю

        // Логін (username) тепер тільки для читання, тому не змінюємо його через цю форму.
        // Зміни в логіці username вище, якщо ви все ж захочете дозволити його змінювати.
        // Наразі, поле profileUsernameInput має атрибут `readonly`.
        // originalUsername все одно залишається для перевірки, що профіль змінюється для правильного користувача.

        // --- Логіка зміни нікнейму ---
        if (newNickname !== (userProfile.nickname || '')) {
            userProfile.nickname = newNickname; // Оновлюємо нікнейм в об'єкті профілю
            changesMade = true;
            console.log(`Нікнейм для '${currentUser}' змінено на '${newNickname}'.`);
        } else {
            console.log('Нікнейм не змінювався.');
        }

        // --- Логіка зміни нового пароля ---
        if (newPassword.trim() !== '') {
            if (newPassword.length < 6) {
                alert('Новий пароль повинен бути щонайменше 6 символів.');
                return;
            }
            let users = getStoredUsers();
            const hashedNewPassword = await hashPassword(newPassword);
            users[currentUser] = hashedNewPassword; // Оновлюємо пароль для поточного логіну
            storeUsers(users);
            changesMade = true;
            console.log(`Пароль для '${currentUser}' змінено.`);
            newPasswordInput.value = ''; // Очищаємо поле пароля після збереження
        } else {
            console.log('Новий пароль не введено. Пароль не буде змінено.');
        }

        // --- Логіка збереження аватара ---
        if (profileAvatar.src !== (userProfile.avatar || 'default_avatar.png')) {
            userProfile.avatar = profileAvatar.src; // Оновлюємо URL аватара в даних профілю
            changesMade = true;
            console.log(`Аватар для '${currentUser}' змінено та збережено.`);
        } else {
            console.log('Аватар не змінювався.');
        }

        if (changesMade) {
            saveUserProfile(currentUser, userProfile); // Зберігаємо оновлений профіль (з нікнеймом, аватаром, улюбленими)
            alert('Зміни профілю успішно збережено!');
            updateHeaderProfileIcon();
            updateLoggedInUsernameDisplay(); // Оновлюємо відображуване ім'я після збереження
        } else {
            alert('Жодних змін не було внесено.');
        }

        document.getElementById('newPassword').type = 'password';
        document.querySelector('#profileForm .toggle-password').classList.remove('fa-eye');
        document.querySelector('#profileForm .toggle-password').classList.add('fa-eye-slash');
    });

    logoutFromProfileBtn.addEventListener('click', () => {
        removeCurrentLoggedInUser();
        showContent('login');
        alert('Ви вийшли з облікового запису.');
    });

    // Додаємо обробники для перемикання видимості паролів
    document.querySelectorAll('.toggle-password').forEach(icon => {
        icon.addEventListener('click', togglePasswordVisibility);
    });

    // При першому завантаженні оновлюємо стан кнопок
    // updateFavoriteButtonsState() та renderFavoriteChannels() викликаються в showContent('dashboard')
});