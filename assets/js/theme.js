/**
 * theme.js - Global Theme Manager
 * Supports: 'system' (uses OS preference), 'light', 'dark'
 */

class ThemeManager {
    constructor() {
        this.savedTheme = localStorage.getItem('theme') || 'system';
        this.init();
    }

    /**
     * Get the current theme preference
     * Returns: 'light' | 'dark' | 'system'
     */
    getSavedTheme() {
        return this.savedTheme;
    }

    /**
     * Get the effective theme considering system preference
     * Returns: 'light' | 'dark'
     */
    getEffectiveTheme() {
        if (this.savedTheme === 'system') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return this.savedTheme;
    }

    saveTheme(theme) {
        this.savedTheme = theme;
        localStorage.setItem('theme', theme);
    }

    init() {
        this.applyTheme(this.getEffectiveTheme());
        this.setupToggleButton();
        
        // Listen for system theme changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (this.savedTheme === 'system') {
                    this.applyTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    }

    applyTheme(effectiveTheme) {
        document.body.setAttribute('data-theme', effectiveTheme);
        this.updateToggleIcons(effectiveTheme);
        this.updateCSSVariables(effectiveTheme);
    }

    /**
     * Set theme preference: 'system', 'light', or 'dark'
     */
    setTheme(theme) {
        if (!['system', 'light', 'dark'].includes(theme)) {
            console.warn('Invalid theme:', theme);
            return;
        }
        this.saveTheme(theme);
        this.applyTheme(this.getEffectiveTheme());
    }

    toggleTheme() {
        // Cycle through: system → light → dark → system
        const themes = ['system', 'light', 'dark'];
        const currentIndex = themes.indexOf(this.savedTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        this.setTheme(themes[nextIndex]);
    }

    updateToggleIcons(effectiveTheme) {
        const sunIcon = document.getElementById('sunIcon');
        const moonIcon = document.getElementById('moonIcon');
        
        if (sunIcon && moonIcon) {
            if (effectiveTheme === 'light') {
                sunIcon.classList.add('hidden');
                moonIcon.classList.remove('hidden');
            } else {
                moonIcon.classList.add('hidden');
                sunIcon.classList.remove('hidden');
            }
        }
    }

    updateCSSVariables(effectiveTheme) {
        const root = document.documentElement;
        if (effectiveTheme === 'dark') {
            root.style.setProperty('--is-dark', '1');
            root.style.setProperty('--is-light', '0');
        } else {
            root.style.setProperty('--is-dark', '0');
            root.style.setProperty('--is-light', '1');
        }
    }

    setupToggleButton() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }
}

// Initialize theme manager when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.themeManager = new ThemeManager();
    });
} else {
    window.themeManager = new ThemeManager();
}

// Expose methods globally
window.setTheme = (theme) => window.themeManager?.setTheme(theme);
window.toggleTheme = () => window.themeManager?.toggleTheme();
window.getTheme = () => window.themeManager?.getSavedTheme();
window.getEffectiveTheme = () => window.themeManager?.getEffectiveTheme();