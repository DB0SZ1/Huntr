/**
 * Change Password JavaScript
 * Handles password change for authenticated users
 */

// Check if user is authenticated
if (!isAuthenticated()) {
    window.location.href = '/auth.html';
}

const changePasswordForm = document.getElementById('changePasswordForm');
const newPasswordInput = document.getElementById('newPassword');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');

// ============================================================================
// PASSWORD STRENGTH VALIDATOR
// ============================================================================

const passwordRequirements = {
    length: password => password.length >= 8,
    uppercase: password => /[A-Z]/.test(password),
    lowercase: password => /[a-z]/.test(password),
    number: password => /[0-9]/.test(password)
};

function checkPasswordStrength(password) {
    let strength = 0;
    const met = [];
    
    for (const [requirement, check] of Object.entries(passwordRequirements)) {
        if (check(password)) {
            strength++;
            met.push(requirement);
        }
    }
    
    return { strength, met };
}

function updatePasswordStrengthUI(password) {
    const { strength } = checkPasswordStrength(password);
    const strengthFill = document.querySelector('.password-strength-fill');
    
    if (password.length === 0) {
        strengthFill.className = 'password-strength-fill';
    } else if (strength <= 1) {
        strengthFill.className = 'password-strength-fill weak';
    } else if (strength <= 2) {
        strengthFill.className = 'password-strength-fill medium';
    } else {
        strengthFill.className = 'password-strength-fill strong';
    }
}

if (newPasswordInput) {
    newPasswordInput.addEventListener('input', (e) => {
        updatePasswordStrengthUI(e.target.value);
    });
}

// ============================================================================
// PASSWORD VISIBILITY TOGGLE
// ============================================================================

function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const button = event.currentTarget;
    
    if (input.type === 'password') {
        input.type = 'text';
        button.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
        input.type = 'password';
        button.innerHTML = '<i class="fas fa-eye"></i>';
    }
}

// ============================================================================
// FORM SUBMISSION
// ============================================================================

if (changePasswordForm) {
    changePasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const oldPassword = document.getElementById('oldPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const submitButton = e.target.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        
        // Clear messages
        successMessage.classList.remove('show');
        errorMessage.classList.remove('show');
        
        // Validate passwords match
        if (newPassword !== confirmPassword) {
            showError('New passwords do not match');
            return;
        }
        
        // Validate password strength
        const { strength } = checkPasswordStrength(newPassword);
        if (strength < 3) {
            showError('New password does not meet strength requirements (at least 8 characters, uppercase, lowercase, and number)');
            return;
        }
        
        // Validate old password is different from new
        if (oldPassword === newPassword) {
            showError('New password must be different from your current password');
            return;
        }
        
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Changing...';
        
        try {
            await changePassword({
                old_password: oldPassword,
                new_password: newPassword
            });
            
            // Success
            showSuccess('Password changed successfully!');
            e.target.reset();
            updatePasswordStrengthUI('');
            
            // Redirect after 2 seconds
            setTimeout(() => {
                window.location.href = '/dashboard.html';
            }, 2000);
            
        } catch (error) {
            console.error('Change password error:', error);
            showError(error.message || 'Failed to change password. Please try again.');
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    });
}

// ============================================================================
// MESSAGE HELPERS
// ============================================================================

function showSuccess(message) {
    successMessage.querySelector('span') || (successMessage.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`);
    if (!successMessage.querySelector('span')) {
        successMessage.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    }
    successMessage.classList.add('show');
}

function showError(message) {
    errorText.textContent = message;
    errorMessage.classList.add('show');
    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorMessage.classList.remove('show');
    }, 5000);
}
