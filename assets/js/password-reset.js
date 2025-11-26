/**
 * Password Reset JavaScript
 * Handles forgot password and password reset flows
 */

const forgotPasswordForm = document.getElementById('forgotPasswordForm');
const resetPasswordForm = document.getElementById('resetPasswordForm');
const forgotPasswordFormElement = document.getElementById('forgotPasswordFormElement');
const resetPasswordFormElement = document.getElementById('resetPasswordFormElement');
const newPasswordInput = document.getElementById('newPassword');
const resetToken = document.getElementById('resetToken');

// Get token from URL if present
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
        resetToken.value = token;
        forgotPasswordForm.style.display = 'none';
        resetPasswordForm.style.display = 'block';
    }
});

// ============================================================================
// FORGOT PASSWORD
// ============================================================================

if (forgotPasswordFormElement) {
    forgotPasswordFormElement.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = e.target.querySelector('input[type="email"]').value;
        const submitButton = e.target.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        
        try {
            await forgotPassword(email);
            
            // Show success message
            alert('Password reset link has been sent to your email. Please check your inbox.');
            
            // Reset form
            e.target.reset();
            submitButton.disabled = false;
            submitButton.textContent = originalText;
            
        } catch (error) {
            console.error('Forgot password error:', error);
            alert(error.message || 'Failed to send reset link. Please try again.');
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    });
}

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
    const { strength, met } = checkPasswordStrength(password);
    const strengthFill = document.querySelector('.password-strength-fill');
    
    // Update strength indicator
    if (password.length === 0) {
        strengthFill.className = 'password-strength-fill';
    } else if (strength <= 1) {
        strengthFill.className = 'password-strength-fill weak';
    } else if (strength <= 2) {
        strengthFill.className = 'password-strength-fill medium';
    } else {
        strengthFill.className = 'password-strength-fill strong';
    }
    
    // Update requirements
    document.querySelectorAll('.requirement').forEach(req => {
        const requirement = req.getAttribute('data-requirement');
        if (met.includes(requirement)) {
            req.classList.add('met');
            req.querySelector('i').className = 'fas fa-check';
        } else {
            req.classList.remove('met');
            req.querySelector('i').className = 'fas fa-times';
        }
    });
}

if (newPasswordInput) {
    newPasswordInput.addEventListener('input', (e) => {
        updatePasswordStrengthUI(e.target.value);
    });
}

// ============================================================================
// RESET PASSWORD
// ============================================================================

if (resetPasswordFormElement) {
    resetPasswordFormElement.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const token = document.getElementById('resetToken').value;
        
        // Validate passwords match
        if (newPassword !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        
        // Validate password strength
        const { strength } = checkPasswordStrength(newPassword);
        if (strength < 3) {
            alert('Password does not meet strength requirements. Please check the requirements above.');
            return;
        }
        
        const submitButton = e.target.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Resetting...';
        
        try {
            await resetPassword({
                token: token,
                new_password: newPassword
            });
            
            // Show success message
            document.getElementById('successMessage').classList.add('show');
            
            // Redirect to login after 2 seconds
            setTimeout(() => {
                window.location.href = '/auth.html';
            }, 2000);
            
        } catch (error) {
            console.error('Reset password error:', error);
            alert(error.message || 'Failed to reset password. Please try again.');
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    });
}
