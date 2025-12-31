// Career Audit Booking JavaScript - Direct Form Access (No Payment)

document.addEventListener('DOMContentLoaded', function() {
    console.log('Career Audit page loaded - Free booking enabled');
});

// Open modal function
function openAuditModal() {
    const modal = document.getElementById('audit-booking-modal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Close modal function
function closeAuditModal() {
    const modal = document.getElementById('audit-booking-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Make functions globally accessible
window.openAuditModal = openAuditModal;
window.closeAuditModal = closeAuditModal;
