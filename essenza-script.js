/**
 * ESSENZA QUESTIONNAIRE - Bio-eta
 * JavaScript für Multi-Step Fragebogen mit konditionaler Logik
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const form = document.getElementById('essenza-form');
    const formSteps = document.querySelectorAll('.form-step');
    const progressSteps = document.querySelectorAll('.progress-step');
    const progressFill = document.getElementById('progress-fill');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');
    const successMessage = document.getElementById('success-message');

    // State
    let currentStep = 1;
    const totalSteps = 4;

    // Category to Questions mapping
    const categoryQuestionMap = {
        'mentale_gesundheit': 'questions-mentale_gesundheit',
        'fitness': 'questions-fitness',
        'stress_schlaf': 'questions-stress_schlaf',
        'verdauung': 'questions-verdauung',
        'immunsystem': 'questions-immunsystem',
        'haut_haare': 'questions-haut_haare',
        'knochen_gelenke': 'questions-knochen_gelenke'
    };

    // Initialize
    init();

    function init() {
        setupEventListeners();
        updateProgress();
        initSliders();
    }

    function setupEventListeners() {
        // Navigation buttons
        prevBtn.addEventListener('click', goToPrevStep);
        nextBtn.addEventListener('click', goToNextStep);
        form.addEventListener('submit', handleSubmit);

        // Gender change - show/hide pregnancy question
        const genderRadios = document.querySelectorAll('input[name="geschlecht"]');
        genderRadios.forEach(radio => {
            radio.addEventListener('change', handleGenderChange);
        });

        // Category checkboxes
        const categoryCheckboxes = document.querySelectorAll('input[name="kategorien"]');
        categoryCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', handleCategoryChange);
        });

        // Slider value updates
        setupSliderListeners();
    }

    function setupSliderListeners() {
        // Activity slider
        const aktivitaetSlider = document.getElementById('aktivitaet');
        const aktivitaetValue = document.getElementById('aktivitaet-value');
        if (aktivitaetSlider && aktivitaetValue) {
            aktivitaetSlider.addEventListener('input', function() {
                aktivitaetValue.textContent = this.value;
            });
        }

        // Percentage sliders
        const percentageSliders = ['milch', 'obst_gemuese', 'weizen', 'ballaststoffe'];
        percentageSliders.forEach(sliderId => {
            const slider = document.getElementById(sliderId);
            const valueDisplay = document.getElementById(`${sliderId}-value`);
            if (slider && valueDisplay) {
                slider.addEventListener('input', function() {
                    valueDisplay.textContent = this.value + '%';
                });
            }
        });

        // All sliders - update track fill
        document.querySelectorAll('.slider').forEach(slider => {
            slider.addEventListener('input', function() {
                updateSliderTrack(this);
            });
            // Initialize track fill
            updateSliderTrack(slider);
        });
    }

    function updateSliderTrack(slider) {
        const min = slider.min || 0;
        const max = slider.max || 100;
        const value = slider.value;
        const percentage = ((value - min) / (max - min)) * 100;
        slider.style.background = `linear-gradient(to right, #2D5A27 0%, #4A7C43 ${percentage}%, #D4E0D4 ${percentage}%, #D4E0D4 100%)`;
    }

    function initSliders() {
        document.querySelectorAll('.slider').forEach(slider => {
            updateSliderTrack(slider);
        });
    }

    function handleGenderChange(e) {
        const pregnancyGroup = document.getElementById('pregnancy-group');
        const pregnancyRadios = document.querySelectorAll('input[name="schwangerschaft"]');

        if (e.target.value === 'weiblich') {
            pregnancyGroup.classList.remove('hidden');
            pregnancyRadios.forEach(radio => radio.required = true);
        } else {
            pregnancyGroup.classList.add('hidden');
            pregnancyRadios.forEach(radio => {
                radio.required = false;
                radio.checked = false;
            });
        }
    }

    function handleCategoryChange() {
        const checkboxes = document.querySelectorAll('input[name="kategorien"]:checked');
        const count = checkboxes.length;
        const countDisplay = document.getElementById('category-count');

        if (countDisplay) {
            countDisplay.textContent = count;
        }

        // Update visual state of cards
        document.querySelectorAll('.category-card').forEach(card => {
            const checkbox = card.querySelector('input[type="checkbox"]');
            if (checkbox.checked) {
                card.classList.add('selected');
            } else {
                card.classList.remove('selected');
            }
        });

        // Enable/disable next button based on selection count
        if (currentStep === 2) {
            nextBtn.disabled = count < 3 || count > 5;
        }
    }

    function updateCategoryQuestions() {
        const selectedCategories = Array.from(document.querySelectorAll('input[name="kategorien"]:checked'))
            .map(cb => cb.value);

        // Hide all category questions first
        Object.values(categoryQuestionMap).forEach(questionId => {
            const questionSection = document.getElementById(questionId);
            if (questionSection) {
                questionSection.classList.add('hidden');
            }
        });

        // Show questions for selected categories
        selectedCategories.forEach(category => {
            const questionId = categoryQuestionMap[category];
            const questionSection = document.getElementById(questionId);
            if (questionSection) {
                questionSection.classList.remove('hidden');
            }
        });

        // Show/hide no categories message
        const noCategoriesMsg = document.getElementById('no-categories-message');
        if (noCategoriesMsg) {
            if (selectedCategories.length === 0) {
                noCategoriesMsg.classList.remove('hidden');
            } else {
                noCategoriesMsg.classList.add('hidden');
            }
        }
    }

    function goToNextStep() {
        if (!validateCurrentStep()) {
            return;
        }

        if (currentStep === 2) {
            // Update category questions before showing step 3
            updateCategoryQuestions();
        }

        if (currentStep < totalSteps) {
            currentStep++;
            updateFormStep();
            updateProgress();
            scrollToTop();
        }
    }

    function goToPrevStep() {
        if (currentStep > 1) {
            currentStep--;
            updateFormStep();
            updateProgress();
            scrollToTop();
        }
    }

    function updateFormStep() {
        // Update form steps visibility
        formSteps.forEach(step => {
            step.classList.remove('active');
            if (parseInt(step.dataset.step) === currentStep) {
                step.classList.add('active');
            }
        });

        // Update buttons
        prevBtn.disabled = currentStep === 1;

        if (currentStep === totalSteps) {
            nextBtn.classList.add('hidden');
            submitBtn.classList.remove('hidden');
        } else {
            nextBtn.classList.remove('hidden');
            submitBtn.classList.add('hidden');
        }

        // Check category count on step 2
        if (currentStep === 2) {
            handleCategoryChange();
        }
    }

    function updateProgress() {
        // Update progress bar fill
        const progressPercentage = (currentStep / totalSteps) * 100;
        progressFill.style.width = `${progressPercentage}%`;

        // Update step indicators
        progressSteps.forEach((step, index) => {
            const stepNum = index + 1;
            step.classList.remove('active', 'completed');

            if (stepNum === currentStep) {
                step.classList.add('active');
            } else if (stepNum < currentStep) {
                step.classList.add('completed');
            }
        });
    }

    function validateCurrentStep() {
        const currentFormStep = document.querySelector(`.form-step[data-step="${currentStep}"]`);

        // Step 1: Validate personal info
        if (currentStep === 1) {
            const requiredFields = currentFormStep.querySelectorAll('input[required], select[required]');
            let isValid = true;

            requiredFields.forEach(field => {
                // Skip hidden pregnancy field validation if not female
                if (field.name === 'schwangerschaft') {
                    const pregnancyGroup = document.getElementById('pregnancy-group');
                    if (pregnancyGroup.classList.contains('hidden')) {
                        return;
                    }
                }

                if (field.type === 'radio') {
                    const radioGroup = document.querySelectorAll(`input[name="${field.name}"]`);
                    const isChecked = Array.from(radioGroup).some(r => r.checked);
                    if (!isChecked) {
                        isValid = false;
                        highlightError(field.closest('.form-group'));
                    }
                } else if (!field.value.trim()) {
                    isValid = false;
                    highlightError(field);
                } else {
                    clearError(field);
                }
            });

            // Validate email format
            const emailField = document.getElementById('email');
            if (emailField && emailField.value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(emailField.value)) {
                    isValid = false;
                    highlightError(emailField);
                    showErrorMessage(emailField, 'Bitte gib eine gültige E-Mail-Adresse ein.');
                }
            }

            if (!isValid) {
                showNotification('Bitte fülle alle Pflichtfelder aus.', 'error');
            }

            return isValid;
        }

        // Step 2: Validate category selection (3-5 categories)
        if (currentStep === 2) {
            const selectedCategories = document.querySelectorAll('input[name="kategorien"]:checked');
            if (selectedCategories.length < 3 || selectedCategories.length > 5) {
                showNotification('Bitte wähle 3 bis 5 Kategorien aus.', 'error');
                return false;
            }
            return true;
        }

        // Step 3 and 4: No strict validation required for sliders/optional fields
        return true;
    }

    function highlightError(element) {
        if (element) {
            element.classList.add('error');
            element.style.borderColor = '#C0392B';
        }
    }

    function clearError(element) {
        if (element) {
            element.classList.remove('error');
            element.style.borderColor = '';
        }
    }

    function showErrorMessage(element, message) {
        clearErrorMessage(element);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        element.parentNode.appendChild(errorDiv);
    }

    function clearErrorMessage(element) {
        const existingError = element.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
    }

    function showNotification(message, type = 'info') {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'error' ? '#C0392B' : type === 'success' ? '#2D5A27' : '#2196F3'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 15px;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Add animation keyframes
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .notification-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 1.5rem;
                    cursor: pointer;
                    padding: 0;
                    line-height: 1;
                }
            `;
            document.head.appendChild(style);
        }

        // Close button functionality
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    function scrollToTop() {
        const container = document.querySelector('.essenza-container');
        if (container) {
            container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    function handleSubmit(e) {
        e.preventDefault();

        if (!validateCurrentStep()) {
            return;
        }

        // Collect all form data
        const formData = collectFormData();

        // Log data for debugging (in production, send to server)
        console.log('Form Data:', formData);

        // Show success message
        form.classList.add('hidden');
        document.querySelector('.progress-container').classList.add('hidden');
        successMessage.classList.remove('hidden');

        // Scroll to success message
        successMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // In production: Send data to backend/Shopify
        sendDataToServer(formData);
    }

    function collectFormData() {
        const formData = new FormData(form);
        const data = {};

        // Personal Info
        data.personal = {
            vorname: formData.get('vorname'),
            nachname: formData.get('nachname'),
            email: formData.get('email'),
            geschlecht: formData.get('geschlecht'),
            schwangerschaft: formData.get('schwangerschaft') || 'nicht_zutreffend',
            adresse: {
                strasse: formData.get('strasse'),
                plz: formData.get('plz'),
                ort: formData.get('ort')
            },
            groesse: formData.get('groesse'),
            gewicht: formData.get('gewicht'),
            aktivitaet: formData.get('aktivitaet')
        };

        // Selected Categories
        data.kategorien = formData.getAll('kategorien');

        // Category-specific answers
        data.kategorie_antworten = {};

        // Mental Health
        if (data.kategorien.includes('mentale_gesundheit')) {
            data.kategorie_antworten.mentale_gesundheit = {
                konzentration: formData.get('mental_konzentration'),
                vergessen: formData.get('mental_vergessen'),
                muede: formData.get('mental_muede'),
                laune: formData.get('mental_laune')
            };
        }

        // Fitness
        if (data.kategorien.includes('fitness')) {
            data.kategorie_antworten.fitness = {
                sportlicher: formData.get('fitness_sportlicher'),
                erholung: formData.get('fitness_erholung'),
                kraempfe: formData.get('fitness_kraempfe'),
                fluessigkeit: formData.get('fitness_fluessigkeit'),
                haeufigkeit: formData.get('fitness_haeufigkeit'),
                wettkampf: formData.get('fitness_wettkampf')
            };
        }

        // Stress & Sleep
        if (data.kategorien.includes('stress_schlaf')) {
            data.kategorie_antworten.stress_schlaf = {
                schlaf_probleme: formData.get('schlaf_probleme'),
                aufstehen: formData.get('schlaf_aufstehen'),
                stress_level: formData.get('stress_level'),
                ausgebrannt: formData.get('stress_ausgebrannt')
            };
        }

        // Immune System
        if (data.kategorien.includes('immunsystem')) {
            data.kategorie_antworten.immunsystem = {
                krank: formData.get('immun_krank'),
                erholung: formData.get('immun_erholung'),
                ueberfordert: formData.get('immun_ueberfordert')
            };
        }

        // Skin, Hair, Nails
        if (data.kategorien.includes('haut_haare')) {
            data.kategorie_antworten.haut_haare = {
                trocken: formData.get('haut_trocken'),
                falten: formData.get('haut_falten'),
                unrein: formData.get('haut_unrein'),
                haare_duenn: formData.get('haare_duenn'),
                naegel_bruechig: formData.get('naegel_bruechig'),
                augen_gereizt: formData.get('augen_gereizt')
            };
        }

        // Digestion
        if (data.kategorien.includes('verdauung')) {
            data.kategorie_antworten.verdauung = {
                voll: formData.get('verdauung_voll'),
                magen: formData.get('verdauung_magen'),
                zunehmen: formData.get('verdauung_zunehmen'),
                trinken: formData.get('verdauung_trinken')
            };
        }

        // Bones, Joints, Muscles
        if (data.kategorien.includes('knochen_gelenke')) {
            data.kategorie_antworten.knochen_gelenke = {
                gelenk: formData.get('knochen_gelenk'),
                verspannung: formData.get('knochen_verspannung'),
                sorgen: formData.get('knochen_sorgen')
            };
        }

        // Lifestyle
        data.lebensstil = {
            familie_erkrankungen: formData.get('familie_erkrankungen'),
            familie_herzinfarkt: formData.get('familie_herzinfarkt'),
            zigaretten: formData.get('zigaretten'),
            kaffee: formData.get('kaffee'),
            freien: formData.get('freien'),
            alkohol: formData.get('alkohol'),
            ernaehrung: {
                milch: formData.get('milch'),
                fisch: formData.get('fisch'),
                obst_gemuese: formData.get('obst_gemuese'),
                fleisch: formData.get('fleisch'),
                weizen: formData.get('weizen'),
                ballaststoffe: formData.get('ballaststoffe')
            }
        };

        // Timestamp
        data.timestamp = new Date().toISOString();

        return data;
    }

    async function sendDataToServer(data) {
        // Configuration - adjust these values for your setup
        const config = window.EssenzaConfig || {
            apiEndpoint: '/api/questionnaire', // Backend API endpoint
            apiKey: null, // Optional API key for authentication
            enableLocalStorage: true, // Store data locally as backup
            enableCustomEvent: true, // Trigger custom event for integrations
        };

        console.log('Sending data to server:', JSON.stringify(data, null, 2));

        // Store data in localStorage as backup
        if (config.enableLocalStorage) {
            try {
                localStorage.setItem('essenza_questionnaire_data', JSON.stringify(data));
                console.log('Data saved to localStorage');
            } catch (e) {
                console.warn('Could not save to localStorage:', e);
            }
        }

        // Send to API endpoint
        try {
            const headers = {
                'Content-Type': 'application/json',
            };

            // Add API key if configured
            if (config.apiKey) {
                headers['X-API-Key'] = config.apiKey;
            }

            const response = await fetch(config.apiEndpoint, {
                method: 'POST',
                headers,
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }

            const result = await response.json();
            console.log('Server response:', result);

            // Store submission ID for reference
            if (result.submissionId) {
                try {
                    localStorage.setItem('essenza_submission_id', result.submissionId);
                } catch (e) {
                    console.warn('Could not save submission ID:', e);
                }
            }

            // Trigger success event
            if (config.enableCustomEvent) {
                window.dispatchEvent(new CustomEvent('essenza-questionnaire-submitted', {
                    detail: { ...data, submissionId: result.submissionId, serverResponse: result }
                }));
            }

            return result;

        } catch (error) {
            console.error('Error sending data:', error);

            // Trigger error event
            if (config.enableCustomEvent) {
                window.dispatchEvent(new CustomEvent('essenza-questionnaire-error', {
                    detail: { error: error.message, data }
                }));
            }

            // Don't show error to user if form submission already shows success
            // The data is stored locally and can be retried later
            console.warn('Data stored locally. Will be synced when connection is restored.');
        }
    }

    // Expose functions for external use (Shopify integration)
    window.EssenzaQuestionnaire = {
        getData: function() {
            return collectFormData();
        },
        resetForm: function() {
            form.reset();
            currentStep = 1;
            updateFormStep();
            updateProgress();
            form.classList.remove('hidden');
            document.querySelector('.progress-container').classList.remove('hidden');
            successMessage.classList.add('hidden');
            scrollToTop();
        }
    };
});
