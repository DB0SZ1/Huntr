/**
 * Authentication JavaScript - COMPLETE
 * Real Google OAuth + Traditional Email/Password
 */

// API Base URL
const API_BASE_URL = 'http://localhost:8000';

// Tab switching
const signupTab = document.getElementById('signupTab');
const signinTab = document.getElementById('signinTab');
const signupForm = document.getElementById('signupForm');
const signinForm = document.getElementById('signinForm');

if (signupTab && signinTab) {
    signupTab.addEventListener('click', () => {
        signupTab.classList.add('active');
        signinTab.classList.remove('active');
        signupForm.style.display = 'block';
        signinForm.style.display = 'none';
    });

    signinTab.addEventListener('click', () => {
        signinTab.classList.add('active');
        signupTab.classList.remove('active');
        signinForm.style.display = 'block';
        signupForm.style.display = 'none';
    });
}

// Real Google OAuth Login
function loginWithGoogle() {
    window.location.href = `${API_BASE_URL}/api/auth/google/login`;
}

// Traditional Sign Up
const signupFormElement = document.getElementById('signupFormElement');
if (signupFormElement) {
    signupFormElement.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = e.target.querySelector('input[type="email"]').value;
        const password = e.target.querySelector('input[type="password"]');
        const confirmPassword = e.target.querySelector('input[data-confirm-password]');
        
        // Get name from first and last name inputs or fallback
        const firstName = e.target.querySelector('input[placeholder="First name"]')?.value || '';
        const lastName = e.target.querySelector('input[placeholder="Last name"]')?.value || '';
        const name = `${firstName} ${lastName}`.trim() || email.split('@')[0];
        
        const passwordValue = password ? password.value : '';
        const confirmPasswordValue = confirmPassword ? confirmPassword.value : '';
        
        // Validate password if fields exist
        if (password && passwordValue !== confirmPasswordValue) {
            alert('Passwords do not match');
            return;
        }
        
        const submitButton = e.target.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password: passwordValue,
                    name: name
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.detail || 'Registration failed');
            }
            
            // Success - show verification message
            alert('Account created! Please check your email to verify your account.');
            
            // Redirect to signin after a short delay
            setTimeout(() => {
                signinTab.click();
                e.target.reset();
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }, 2000);
            
        } catch (error) {
            console.error('Signup error:', error);
            alert(error.message || 'Failed to create account. Please try again.');
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    });
}

// Traditional Sign In
const signinFormElement = document.getElementById('signinFormElement');
if (signinFormElement) {
    signinFormElement.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = e.target.querySelector('input[type="email"]').value;
        const password = e.target.querySelector('input[type="password"]').value;
        
        const submitButton = e.target.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.detail || 'Login failed');
            }
            
            // Store tokens
            localStorage.setItem('access_token', data.access_token);
            if (data.refresh_token) {
                localStorage.setItem('refresh_token', data.refresh_token);
            }
            localStorage.setItem('is_authenticated', 'true');
            
            // Redirect to dashboard
            window.location.href = '/dashboard.html';
            
        } catch (error) {
            console.error('Login error:', error);
            alert(error.message || 'Failed to sign in. Please check your credentials.');
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    });
}

// Attach Google login to all Google buttons
document.addEventListener('DOMContentLoaded', () => {
    const googleButtons = document.querySelectorAll('.social-btn');
    googleButtons.forEach(btn => {
        if (btn.textContent.includes('Google')) {
            btn.onclick = loginWithGoogle;
        }
    });
});

// Check if already authenticated
if (localStorage.getItem('access_token')) {
    window.location.href = '/dashboard.html';
}