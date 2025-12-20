// Career Audit Payment JavaScript with Stripe Integration
// https://nhscareerboost-server.onrender.com
// http://localhost:3000
const API_BASE_URL = 'http://localhost:3000';
const PAYMENT_API_ENDPOINT = `${API_BASE_URL}/api/payment/create-payment-intent`;
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51RMAlgD8x0lOeX6HcgBqcnHpdaHQQbg24qCPtLRKCyYgB7MyJvVqWq13VMgVjX3RsrdLhA5FF6tK0A3v4Bel3kay00HCDCzJc1';

// Global Stripe variables
let auditStripe = null;
let auditCardElement = null;

// Career Audit Service Details
const CAREER_AUDIT_SERVICE = {
    key: 'career-audit',
    name: 'NHS Career Audit',
    price: 39,
    description: '20-30 minute 1:1 online session'
};

document.addEventListener('DOMContentLoaded', function() {
    console.log('Career Audit page loaded');
    
    // Initialize Stripe
    if (typeof Stripe !== 'undefined') {
        auditStripe = Stripe(STRIPE_PUBLISHABLE_KEY);
        const elements = auditStripe.elements();
        
        // Create card element
        auditCardElement = elements.create('card', {
            style: {
                base: {
                    fontSize: '16px',
                    color: '#333',
                    '::placeholder': {
                        color: '#aab7c4',
                    },
                },
                invalid: {
                    color: '#dc3545',
                },
            },
        });
        
        // Mount card element
        auditCardElement.mount('#audit-card-element');
        
        // Handle real-time validation errors
        auditCardElement.on('change', function(event) {
            const displayError = document.getElementById('audit-card-errors');
            if (event.error) {
                displayError.textContent = event.error.message;
            } else {
                displayError.textContent = '';
            }
        });
        
        console.log('Stripe initialized for Career Audit');
    } else {
        console.error('Stripe.js not loaded');
    }
    
    // Handle payment form submission
    const auditPaymentForm = document.getElementById('audit-stripe-payment-form');
    if (auditPaymentForm) {
        auditPaymentForm.addEventListener('submit', handleAuditPayment);
    }
});

// Open modal function
function openAuditModal() {
    const modal = document.getElementById('audit-payment-modal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Close modal function
function closeAuditModal() {
    const modal = document.getElementById('audit-payment-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Reset form
        const paymentSection = document.getElementById('audit-payment-section');
        const successSection = document.getElementById('audit-success-and-form-section');
        
        if (paymentSection) paymentSection.style.display = 'block';
        if (successSection) successSection.style.display = 'none';
        
        // Clear form fields
        const form = document.getElementById('audit-stripe-payment-form');
        if (form) form.reset();
        
        // Clear card element
        if (auditCardElement) auditCardElement.clear();
        
        // Clear errors
        const errorElement = document.getElementById('audit-card-errors');
        if (errorElement) errorElement.textContent = '';
    }
}

// Handle payment
async function handleAuditPayment(event) {
    event.preventDefault();
    
    if (!auditStripe || !auditCardElement) {
        showAuditPaymentError('Payment system not initialized. Please refresh the page.');
        return;
    }
    
    // Get form elements
    const submitButton = document.getElementById('audit-payment-submit-btn');
    const buttonText = document.getElementById('audit-payment-button-text');
    const spinner = document.getElementById('audit-payment-spinner');
    
    // Get customer details
    const customerName = document.getElementById('audit-customer-name').value.trim();
    const customerEmail = document.getElementById('audit-customer-email').value.trim();
    
    // Validate
    if (!customerName || !customerEmail) {
        showAuditPaymentError('Please fill in all required fields.');
        return;
    }
    
    // Amount in pence
    const amountInPence = CAREER_AUDIT_SERVICE.price * 100;
    
    // Show loading state
    setAuditPaymentLoading(true, submitButton, buttonText, spinner);
    
    try {
        // Step 1: Create Payment Intent on server
        console.log('Creating payment intent for Career Audit...');
        const response = await fetch(PAYMENT_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: amountInPence,
                currency: 'gbp',
                description: CAREER_AUDIT_SERVICE.name,
                customerName: customerName,
                customerEmail: customerEmail,
                metadata: {
                    service: CAREER_AUDIT_SERVICE.key,
                    serviceName: CAREER_AUDIT_SERVICE.name,
                    customerName: customerName,
                    customerEmail: customerEmail
                }
            }),
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create payment intent');
        }
        
        const { clientSecret, paymentIntentId } = await response.json();
        console.log('Payment intent created:', paymentIntentId);
        
        // Step 2: Confirm payment with Stripe
        console.log('Confirming payment...');
        const { error, paymentIntent } = await auditStripe.confirmCardPayment(
            clientSecret,
            {
                payment_method: {
                    card: auditCardElement,
                    billing_details: {
                        name: customerName,
                        email: customerEmail,
                    },
                },
            }
        );
        
        if (error) {
            // Payment failed
            console.error('Payment error:', error);
            showAuditPaymentError(error.message);
            setAuditPaymentLoading(false, submitButton, buttonText, spinner);
        } else if (paymentIntent.status === 'succeeded') {
            // Payment succeeded!
            console.log('Payment successful:', paymentIntent.id);
            handleAuditPaymentSuccess(paymentIntent, customerName, customerEmail);
        }
        
    } catch (error) {
        console.error('Error:', error);
        showAuditPaymentError(error.message || 'An unexpected error occurred. Please try again.');
        setAuditPaymentLoading(false, submitButton, buttonText, spinner);
    }
}

// Helper functions
function setAuditPaymentLoading(isLoading, submitButton, buttonText, spinner) {
    if (submitButton) {
        submitButton.disabled = isLoading;
    }
    if (buttonText && spinner) {
        if (isLoading) {
            buttonText.style.display = 'none';
            spinner.style.display = 'block';
        } else {
            buttonText.style.display = 'block';
            spinner.style.display = 'none';
        }
    }
}

function showAuditPaymentError(message) {
    const errorElement = document.getElementById('audit-card-errors');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
        alert('Payment Error: ' + message);
    }
}

function handleAuditPaymentSuccess(paymentIntent, customerName, customerEmail) {
    // Keep modal open
    const paymentSection = document.getElementById('audit-payment-section');
    if (paymentSection) {
        paymentSection.style.display = 'none';
    }
    
    // Show success message and booking form
    const successAndFormSection = document.getElementById('audit-success-and-form-section');
    if (successAndFormSection) {
        successAndFormSection.style.display = 'block';
        
        // Scroll to top of modal content
        const modalContent = document.querySelector('.payment-modal-content');
        if (modalContent) {
            modalContent.scrollTop = 0;
        }
    }
    
    // Log payment details
    console.log('Career Audit payment successful:', {
        paymentIntentId: paymentIntent.id,
        customerName: customerName,
        customerEmail: customerEmail,
        amount: CAREER_AUDIT_SERVICE.price
    });
    
    // Send confirmation email (handled by backend webhook)
}

// Make functions globally accessible
window.openAuditModal = openAuditModal;
window.closeAuditModal = closeAuditModal;
