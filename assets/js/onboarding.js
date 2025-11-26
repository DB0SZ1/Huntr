   let currentScreen = 1;
        const totalScreens = 5;
        const userData = {
            profileType: null,
            interests: [],
            workPreferences: [],
            whatsapp: '',
            email: '',
            notifications: true,
            dailyDigest: true
        };

        // Theme Toggle - Handled by theme.js
        // Theme manager already initialized globally

        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            setupScreen1();
            setupScreen2();
            setupScreen3();
            setupScreen4();
        });

        // Screen 1: Profile Type Selection
        function setupScreen1() {
            const pills = document.querySelectorAll('[data-screen="1"] .selection-pill');
            const nextBtn = document.getElementById('btn-1');
            const otherInputContainer = document.getElementById('otherInputContainer');
            const otherNicheInput = document.getElementById('otherNicheInput');

            pills.forEach(pill => {
                pill.addEventListener('click', () => {
                    pills.forEach(p => p.classList.remove('selected'));
                    pill.classList.add('selected');
                    
                    const value = pill.dataset.value;
                    
                    // Show/hide other input field
                    if (value === 'other') {
                        otherInputContainer.classList.add('show');
                        otherNicheInput.focus();
                        // Enable button only if other field has value
                        checkOtherInput();
                    } else {
                        otherInputContainer.classList.remove('show');
                        userData.profileType = value;
                        userData.otherNiche = '';
                        nextBtn.disabled = false;
                    }
                });
            });

            // Check other input field
            function checkOtherInput() {
                const value = otherNicheInput.value.trim();
                if (value.length > 0) {
                    userData.profileType = 'other';
                    userData.otherNiche = value;
                    nextBtn.disabled = false;
                } else {
                    nextBtn.disabled = true;
                }
            }

            otherNicheInput.addEventListener('input', checkOtherInput);

            nextBtn.addEventListener('click', () => goToScreen(2));
        }

        // Screen 2: Interests Selection
        function setupScreen2() {
            const checkboxes = document.querySelectorAll('[data-screen="2"] .checkbox-item');
            const nextBtn = document.getElementById('btn-2');

            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('click', () => {
                    checkbox.classList.toggle('checked');
                    updateInterests();
                    nextBtn.disabled = userData.interests.length === 0;
                });
            });

            function updateInterests() {
                userData.interests = [];
                checkboxes.forEach(cb => {
                    if (cb.classList.contains('checked')) {
                        userData.interests.push(cb.dataset.value);
                    }
                });
            }

            nextBtn.addEventListener('click', () => goToScreen(3));
        }

        // Screen 3: Work Preferences
        function setupScreen3() {
            const checkboxes = document.querySelectorAll('[data-screen="3"] .checkbox-item');
            const nextBtn = document.getElementById('btn-3');

            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('click', () => {
                    checkbox.classList.toggle('checked');
                    updateWorkPreferences();
                    nextBtn.disabled = userData.workPreferences.length === 0;
                });
            });

            function updateWorkPreferences() {
                userData.workPreferences = [];
                checkboxes.forEach(cb => {
                    if (cb.classList.contains('checked')) {
                        userData.workPreferences.push(cb.dataset.value);
                    }
                });
            }

            nextBtn.addEventListener('click', () => goToScreen(4));
        }

        // Screen 4: Contact Info with Validation
        function setupScreen4() {
            const whatsappInput = document.getElementById('whatsappInput');
            const emailInput = document.getElementById('emailInput');
            const phoneValidation = document.getElementById('phoneValidation');
            const emailValidation = document.getElementById('emailValidation');
            const nextBtn = document.getElementById('btn-4');
            const checkboxes = document.querySelectorAll('[data-screen="4"] .checkbox-item');

            // WhatsApp validation
            whatsappInput.addEventListener('input', (e) => {
                const value = e.target.value;
                const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
                
                if (phoneRegex.test(value)) {
                    phoneValidation.classList.add('success');
                    userData.whatsapp = value;
                    checkNextButton();
                } else {
                    phoneValidation.classList.remove('success');
                    userData.whatsapp = '';
                    checkNextButton();
                }
            });

            // Email validation (optional)
            emailInput.addEventListener('input', (e) => {
                const value = e.target.value;
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                
                if (value === '' || emailRegex.test(value)) {
                    emailValidation.classList.add('success');
                    userData.email = value;
                } else {
                    emailValidation.classList.remove('success');
                }
            });

            // Notification preferences
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('click', () => {
                    checkbox.classList.toggle('checked');
                    if (checkbox.dataset.value === 'notifications') {
                        userData.notifications = checkbox.classList.contains('checked');
                    } else if (checkbox.dataset.value === 'daily') {
                        userData.dailyDigest = checkbox.classList.contains('checked');
                    }
                });
            });

            function checkNextButton() {
                nextBtn.disabled = userData.whatsapp === '';
            }

            nextBtn.addEventListener('click', () => {
                console.log('User Data:', userData);
                // Save onboarding data to API
                saveOnboardingData();
                goToScreen(5);
            });
        }

        // Save onboarding data to API
        async function saveOnboardingData() {
            try {
                const response = await API.saveOnboarding({
                    profile_type: userData.profileType,
                    interests: userData.interests,
                    work_preferences: userData.workPreferences,
                    contact_whatsapp: userData.whatsapp,
                    contact_email: userData.email,
                    notifications_enabled: userData.notifications,
                    daily_digest: userData.dailyDigest
                });
                console.log('Onboarding data saved successfully:', response);
            } catch (error) {
                console.warn('Failed to save onboarding data to API, continuing with local storage:', error);
                // Continue anyway - user can retry later
            }
        }

        // Navigation
        function goToScreen(screenNumber) {
            if (screenNumber < 1 || screenNumber > totalScreens) return;

            // Get current and new screen elements
            const currentScreenEl = document.querySelector(`[data-screen="${currentScreen}"]`);
            const newScreenEl = document.querySelector(`[data-screen="${screenNumber}"]`);

            // Fade out current screen
            currentScreenEl.classList.add('fadeOut');
            
            // Wait for fade out animation, then switch
            setTimeout(() => {
                currentScreenEl.classList.remove('active', 'fadeOut');
                newScreenEl.classList.add('active');
                
                // Update progress pills
                updateProgressPills(screenNumber);
                
                // Update current screen
                currentScreen = screenNumber;
                
                // Scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 400); // Match fadeOut animation duration
        }

        function updateProgressPills(screenNumber) {
            const pills = document.querySelectorAll('.progress-pill');
            pills.forEach((pill, index) => {
                const pillStep = index + 1;
                pill.classList.remove('active', 'completed');
                
                if (pillStep < screenNumber) {
                    pill.classList.add('completed');
                } else if (pillStep === screenNumber) {
                    pill.classList.add('active');
                }
            });
        }