/**
 * Email Verification JavaScript
 * Handles email verification flow
 */

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    const statusIcon = document.getElementById('statusIcon');
    const statusTitle = document.getElementById('statusTitle');
    const statusDetails = document.getElementById('statusDetails');
    const actionButtons = document.getElementById('actionButtons');
    const dashboardBtn = document.getElementById('dashboardBtn');
    
    // If no token, show error
    if (!token) {
        statusIcon.className = 'verification-icon error';
        statusIcon.innerHTML = '<i class="fas fa-times-circle"></i>';
        statusTitle.textContent = 'Verification Failed';
        statusDetails.textContent = 'No verification token found. Please check your email link.';
        actionButtons.style.display = 'flex';
        return;
    }
    
    try {
        // Verify email with token
        const response = await verifyEmail(token);
        
        // Success!
        statusIcon.className = 'verification-icon success';
        statusIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
        statusTitle.textContent = 'Email Verified!';
        statusDetails.textContent = 'Your email has been successfully verified. You can now access all features.';
        
        // Show action buttons
        actionButtons.style.display = 'flex';
        dashboardBtn.style.display = 'inline-block';
        
        // Auto-redirect to dashboard after 3 seconds
        setTimeout(() => {
            window.location.href = '/dashboard.html';
        }, 3000);
        
    } catch (error) {
        console.error('Email verification error:', error);
        
        // Error state
        statusIcon.className = 'verification-icon error';
        statusIcon.innerHTML = '<i class="fas fa-times-circle"></i>';
        statusTitle.textContent = 'Verification Failed';
        statusDetails.textContent = error.message || 'An error occurred during email verification. Please try again or contact support.';
        actionButtons.style.display = 'flex';
        dashboardBtn.style.display = 'none';
    }
});
