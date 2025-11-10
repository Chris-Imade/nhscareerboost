// Consultation/Checkout Page JavaScript with Stripe Integration
// https://nhscareerboost-server.onrender.com
const API_BASE_URL = 'https://nhscareerboost-server.onrender.com';
const API_ENDPOINT = `${API_BASE_URL}/api/contact`;
const PAYMENT_API_ENDPOINT = `${API_BASE_URL}/api/payment/create-payment-intent`;

// TODO: Replace with your actual Stripe Publishable Key (pk_live_... or pk_test_...)
const STRIPE_PUBLISHABLE_KEY = 'pk_live_51RMAlgD8x0lOeX6HLILfE2zN253AsQrw77myCQ6gMKhMMiVJnUeFM92tyJZzs1Wn8ZOOTZJkknp6O9FswR2fgBIW00ifi8zHaG';

// Global Stripe variables
let stripe = null;
let cardElement = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('Consultation page loaded');
    
    // Initialize Stripe
    initializeStripe();
    
    // Service packages data
    const packages = {
        'cv-review': {
            name: 'CV Review & Optimisation',
            price: 75,
            features: [
                'Fully marked-up CV',
                '15-minute feedback call',
                'Tailoring guidance',
                'Band-specific tips'
            ]
        },
        'supporting-statement': {
            name: 'Supporting Statement',
            price: 125,
            features: [
                'One-to-one discussion',
                'Fully rewritten statement',
                'STAR framework guidance',
                'Top 5 STAR mistakes guide',
                '5 working days delivery'
            ]
        },
        'mock-interview': {
            name: 'Mock Interview Coaching',
            price: 150,
            features: [
                '60-minute mock session',
                'Real NHS panel questions',
                'Live scoring & feedback',
                'Personalized action plan',
                'Confidence techniques'
            ]
        },
        'complete-package': {
            name: 'Complete Career Boost Package',
            price: 295,
            features: [
                'CV Review & Optimisation',
                'Supporting Statement Rewrite',
                'Mock Interview Coaching',
                'Ideal for Band 5-8 roles',
                'Save £55'
            ]
        }
    };

    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const preselectedService = urlParams.get('service') || 'cv-review';

    // Elements
    const serviceRadios = document.querySelectorAll('input[name="service"]');
    const packageName = document.getElementById('package-name');
    const packagePrice = document.getElementById('package-price');
    const packageFeatures = document.getElementById('package-features');
    const checkoutForm = document.getElementById('checkout-form');
    const paymentSection = document.getElementById('payment-section');
    const successSection = document.getElementById('success-section');
    const detailsFormSection = document.getElementById('details-form-section');
    const stripePayBtn = document.getElementById('stripe-pay-btn');
    const detailsForm = document.getElementById('details-form');

    // Set preselected service
    const preselectedRadio = document.getElementById(preselectedService);
    if (preselectedRadio) {
        preselectedRadio.checked = true;
        updatePackageInfo(preselectedService);
    } else {
        // Default to first option
        updatePackageInfo('cv-review');
    }

    // Service selection change - listen to all radio buttons
    serviceRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked) {
                console.log('Service selected:', this.value);
                updatePackageInfo(this.value);
            }
        });
    });

    // Update package information
    function updatePackageInfo(serviceKey) {
        const pkg = packages[serviceKey];
        if (!pkg) return;

        if (packageName) packageName.textContent = pkg.name;
        if (packagePrice) packagePrice.textContent = `£${pkg.price}`;
        
        if (packageFeatures) {
            packageFeatures.innerHTML = '';
            pkg.features.forEach(feature => {
                const li = document.createElement('li');
                li.style.marginBottom = '10px';
                li.innerHTML = `<i class="fa-solid fa-check text-success"></i> ${feature}`;
                packageFeatures.appendChild(li);
            });
        }
    }

    // Stripe payment button - opens modal
    if (stripePayBtn) {
        stripePayBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get selected service and price
            const selectedService = document.querySelector('input[name="service"]:checked');
            const serviceKey = selectedService ? selectedService.value : 'cv-review';
            const pkg = packages[serviceKey];
            
            // Update modal amount
            const modalAmount = document.getElementById('modal-payment-amount');
            if (modalAmount) {
                modalAmount.textContent = pkg.price.toFixed(2);
            }
            
            // Show payment modal
            const paymentModal = document.getElementById('payment-modal');
            if (paymentModal) {
                paymentModal.classList.add('active');
            }
        });
    }
    
    // Close payment modal
    const closeModalBtn = document.getElementById('close-payment-modal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function() {
            const paymentModal = document.getElementById('payment-modal');
            if (paymentModal) {
                paymentModal.classList.remove('active');
            }
        });
    }
    
    // Close modal when clicking outside
    const paymentModal = document.getElementById('payment-modal');
    if (paymentModal) {
        paymentModal.addEventListener('click', function(e) {
            if (e.target === paymentModal) {
                paymentModal.classList.remove('active');
            }
        });
    }
    
    // Handle Stripe payment form submission
    const stripePaymentForm = document.getElementById('stripe-payment-form');
    if (stripePaymentForm) {
        stripePaymentForm.addEventListener('submit', handleStripePayment);
    }

    // Details form submission
    if (detailsForm) {
        detailsForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(detailsForm);
            const data = Object.fromEntries(formData.entries());
            
            // Get selected service
            const selectedService = document.querySelector('input[name="service"]:checked');
            const serviceKey = selectedService ? selectedService.value : 'cv-review';
            const serviceName = packages[serviceKey].name;
            
            // Prepare data for backend API
            const apiData = {
                name: data.fullname,
                email: data.email,
                phone: data.phone,
                service: serviceName,
                message: `Payment ID: ${data.transaction_ref || 'N/A'}\n` +
                        `NHS Band: ${data.nhs_band || 'N/A'}\n` +
                        `Role Applying For: ${data.role || 'N/A'}\n` +
                        `Additional Notes: ${data.notes || 'N/A'}`
            };
            
            // Disable submit button
            const submitBtn = detailsForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';
            
            try {
                const response = await fetch(API_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(apiData)
                });

                const result = await response.json();

                if (result.success) {
                    // Success
                    alert('✅ Thank you! Your booking has been confirmed. You will receive a confirmation email shortly at ' + data.email);
                    
                    // Redirect to home page after 2 seconds
                    setTimeout(function() {
                        window.location.href = 'index.html';
                    }, 2000);
                } else {
                    // Error from server
                    const errors = result.errors?.map(e => e.message).join('\n') || result.message;
                    alert('❌ Error: ' + errors);
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalBtnText;
                }
            } catch (error) {
                // Network error
                console.error('Network error:', error);
                alert('❌ Network error. Please check your connection and try again.');
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        });
    }
});

// ============================================
// STRIPE INITIALIZATION
// ============================================
function initializeStripe() {
    try {
        if (typeof Stripe === 'undefined') {
            console.error('Stripe.js not loaded');
            return;
        }
        
        stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
        const elements = stripe.elements();
        
        // Create card element with NHS-themed styling
        cardElement = elements.create('card', {
            style: {
                base: {
                    fontSize: '16px',
                    color: '#231f20',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    '::placeholder': {
                        color: '#768692',
                    },
                },
                invalid: {
                    color: '#da291c',
                    iconColor: '#da291c',
                },
            },
        });
        
        cardElement.mount('#card-element');
        
        // Handle real-time validation errors from card element
        cardElement.on('change', (event) => {
            const displayError = document.getElementById('card-errors');
            if (displayError) {
                if (event.error) {
                    displayError.textContent = event.error.message;
                } else {
                    displayError.textContent = '';
                }
            }
        });
        
        console.log('Stripe initialized successfully');
    } catch (error) {
        console.error('Error initializing Stripe:', error);
    }
}

// ============================================
// STRIPE PAYMENT HANDLER
// ============================================
async function handleStripePayment(event) {
    event.preventDefault();
    
    if (!stripe || !cardElement) {
        alert('Payment system not initialized. Please refresh the page.');
        return;
    }
    
    // Get form elements
    const submitButton = document.getElementById('payment-submit-btn');
    const buttonText = document.getElementById('payment-button-text');
    const spinner = document.getElementById('payment-spinner');
    
    // Get customer details
    const customerName = document.getElementById('customer-name').value.trim();
    const customerEmail = document.getElementById('customer-email').value.trim();
    
    // Get selected service and price
    const selectedService = document.querySelector('input[name="service"]:checked');
    const serviceKey = selectedService ? selectedService.value : 'cv-review';
    const packages = {
        'cv-review': { name: 'CV Review & Optimisation', price: 75 },
        'supporting-statement': { name: 'Supporting Statement', price: 125 },
        'mock-interview': { name: 'Mock Interview Coaching', price: 150 },
        'complete-package': { name: 'Complete Career Boost Package', price: 295 }
    };
    const pkg = packages[serviceKey];
    const amountInPence = pkg.price * 100; // Convert to pence
    
    // Show loading state
    setPaymentLoading(true, submitButton, buttonText, spinner);
    
    try {
        // Step 1: Create Payment Intent on server
        console.log('Creating payment intent...');
        const response = await fetch(PAYMENT_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: amountInPence,
                currency: 'gbp',
                customerEmail: customerEmail,
                customerName: customerName,
                metadata: {
                    service: pkg.name,
                    serviceKey: serviceKey,
                    timestamp: new Date().toISOString(),
                },
            }),
        });
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Failed to create payment intent');
        }
        
        console.log('Payment intent created:', data.paymentIntentId);
        
        // Step 2: Confirm the payment with Stripe
        console.log('Confirming payment...');
        const { error, paymentIntent } = await stripe.confirmCardPayment(
            data.clientSecret,
            {
                payment_method: {
                    card: cardElement,
                    billing_details: {
                        name: customerName,
                        email: customerEmail,
                    },
                },
            }
        );
        
        if (error) {
            // Payment failed - show error to customer
            console.error('Payment error:', error);
            showPaymentError(error.message);
            setPaymentLoading(false, submitButton, buttonText, spinner);
        } else if (paymentIntent.status === 'succeeded') {
            // Payment succeeded!
            console.log('Payment successful:', paymentIntent.id);
            handlePaymentSuccess(paymentIntent, customerName, customerEmail);
        }
        
    } catch (error) {
        console.error('Error:', error);
        showPaymentError(error.message || 'An unexpected error occurred. Please try again.');
        setPaymentLoading(false, submitButton, buttonText, spinner);
    }
}

// ============================================
// HELPER FUNCTIONS
// ============================================
function setPaymentLoading(isLoading, submitButton, buttonText, spinner) {
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

function showPaymentError(message) {
    const errorElement = document.getElementById('card-errors');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
        alert('Payment Error: ' + message);
    }
}

function handlePaymentSuccess(paymentIntent, customerName, customerEmail) {
    // Close payment modal
    const paymentModal = document.getElementById('payment-modal');
    if (paymentModal) {
        paymentModal.classList.remove('active');
    }
    
    // Hide payment section
    const paymentSection = document.getElementById('payment-section');
    if (paymentSection) {
        paymentSection.style.display = 'none';
    }
    
    // Show success message
    const successSection = document.getElementById('success-section');
    if (successSection) {
        successSection.style.display = 'block';
    }
    
    // After 3 seconds, show details form
    setTimeout(function() {
        if (successSection) {
            successSection.style.display = 'none';
        }
        
        const detailsFormSection = document.getElementById('details-form-section');
        if (detailsFormSection) {
            detailsFormSection.style.display = 'block';
        }
        
        // Pre-fill transaction reference and customer details
        const transactionRef = document.getElementById('transaction-ref');
        if (transactionRef) {
            transactionRef.value = paymentIntent.id;
        }
        
        // Pre-fill name and email from payment form
        const fullnameInput = document.querySelector('input[name="fullname"]');
        const emailInput = document.querySelector('input[name="email"]');
        if (fullnameInput) fullnameInput.value = customerName;
        if (emailInput) emailInput.value = customerEmail;
    }, 3000);
}
