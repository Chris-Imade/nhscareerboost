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

// Discount code variables
const VALID_DISCOUNT_CODE = 'MCDARKO10';
const DISCOUNT_PERCENTAGE = 10;
let isDiscountApplied = false;
let currentDiscountAmount = 0;
let originalPrice = 0;
let finalPrice = 0;

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
            price: 95,
            features: [
                '30-minute live practice session',
                'Real NHS-style interview questions',
                'Confidence and delivery feedback',
                'Recorded replay (on request)'
            ]
        },
        'complete-package': {
            name: 'Career Boost Package',
            price: 275,
            features: [
                'Complete CV rewrite',
                'Supporting statement tailored for your next role',
                'Mock interview coaching session',
                'Career roadmap & guidance call'
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
    const appointmentDateInput = document.getElementById('appointment-date');
    const appointmentTimeInput = document.getElementById('appointment-time');
    
    // Set minimum date to today
    if (appointmentDateInput) {
        const today = new Date().toISOString().split('T')[0];
        appointmentDateInput.setAttribute('min', today);
    }

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
            
            // Reset discount state when opening modal
            isDiscountApplied = false;
            currentDiscountAmount = 0;
            originalPrice = pkg.price;
            finalPrice = pkg.price;
            
            // Update modal amount
            const modalAmount = document.getElementById('modal-payment-amount');
            if (modalAmount) {
                modalAmount.textContent = pkg.price.toFixed(2);
            }
            
            // Reset discount UI
            const discountInfo = document.getElementById('discount-info');
            const discountCodeInput = document.getElementById('discount-code');
            const discountMessage = document.getElementById('discount-message');
            if (discountInfo) discountInfo.style.display = 'none';
            if (discountCodeInput) discountCodeInput.value = '';
            if (discountMessage) discountMessage.innerHTML = '';
            
            // Show payment modal
            const paymentModal = document.getElementById('payment-modal');
            if (paymentModal) {
                paymentModal.classList.add('active');
                
                // Re-mount card element if needed (ensures it's visible and interactive)
                if (stripe && cardElement) {
                    // Unmount and remount to ensure proper rendering
                    cardElement.unmount();
                    setTimeout(() => {
                        cardElement.mount('#card-element');
                    }, 100);
                }
            }
        });
    }
    
    // Discount code application
    const applyDiscountBtn = document.getElementById('apply-discount-btn');
    const discountCodeInput = document.getElementById('discount-code');
    
    if (applyDiscountBtn && discountCodeInput) {
        applyDiscountBtn.addEventListener('click', function() {
            applyDiscountCode();
        });
        
        // Allow Enter key to apply discount
        discountCodeInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                applyDiscountCode();
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
                appointmentDate: data.appointment_date,
                appointmentTime: data.appointment_time,
                message: `Payment ID: ${data.transaction_ref || 'N/A'}\n` +
                        `Appointment Date: ${data.appointment_date || 'N/A'}\n` +
                        `Appointment Time: ${data.appointment_time || 'N/A'}\n` +
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
                    // Success - redirect to confirmation page with appointment details
                    const params = new URLSearchParams({
                        service: serviceName,
                        date: data.appointment_date,
                        time: data.appointment_time,
                        name: data.fullname,
                        email: data.email
                    });
                    
                    window.location.href = `booking-confirmation.html?${params.toString()}`;
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
// DISCOUNT CODE FUNCTION
// ============================================
function applyDiscountCode() {
    const discountCodeInput = document.getElementById('discount-code');
    const discountMessage = document.getElementById('discount-message');
    const discountInfo = document.getElementById('discount-info');
    const discountAmountSpan = document.getElementById('discount-amount');
    const finalAmountSpan = document.getElementById('final-amount');
    const applyBtn = document.getElementById('apply-discount-btn');
    
    if (!discountCodeInput || !discountMessage) return;
    
    const enteredCode = discountCodeInput.value.trim().toUpperCase();
    
    // Clear previous messages
    discountMessage.innerHTML = '';
    
    // Validate code
    if (!enteredCode) {
        discountMessage.innerHTML = '<span style="color: #dc3545;"><i class="fa-solid fa-exclamation-circle"></i> Please enter a discount code</span>';
        return;
    }
    
    if (enteredCode === VALID_DISCOUNT_CODE) {
        // Valid code - apply discount
        isDiscountApplied = true;
        currentDiscountAmount = (originalPrice * DISCOUNT_PERCENTAGE) / 100;
        finalPrice = originalPrice - currentDiscountAmount;
        
        // Update UI
        discountMessage.innerHTML = '<span style="color: #28a745; font-weight: 600;"><i class="fa-solid fa-check-circle"></i> Discount code applied successfully!</span>';
        
        if (discountInfo) {
            discountInfo.style.display = 'block';
        }
        
        if (discountAmountSpan) {
            discountAmountSpan.textContent = currentDiscountAmount.toFixed(2);
        }
        
        if (finalAmountSpan) {
            finalAmountSpan.textContent = finalPrice.toFixed(2);
        }
        
        // Disable input and button after successful application
        discountCodeInput.disabled = true;
        if (applyBtn) {
            applyBtn.disabled = true;
            applyBtn.style.opacity = '0.6';
            applyBtn.style.cursor = 'not-allowed';
        }
        
        console.log('Discount applied:', {
            original: originalPrice,
            discount: currentDiscountAmount,
            final: finalPrice
        });
    } else {
        // Invalid code
        isDiscountApplied = false;
        currentDiscountAmount = 0;
        finalPrice = originalPrice;
        
        discountMessage.innerHTML = '<span style="color: #dc3545; font-weight: 600;"><i class="fa-solid fa-times-circle"></i> Invalid discount code. Please try again.</span>';
        
        if (discountInfo) {
            discountInfo.style.display = 'none';
        }
        
        console.log('Invalid discount code entered:', enteredCode);
    }
}

// ============================================
// STRIPE INITIALIZATION
// ============================================
function initializeStripe() {
    try {
        if (typeof Stripe === 'undefined') {
            console.error('Stripe.js not loaded - check if script is blocked or failed to load');
            alert('Payment system could not load. Please check your internet connection and disable any ad blockers.');
            return;
        }
        
        console.log('Initializing Stripe with key:', STRIPE_PUBLISHABLE_KEY.substring(0, 20) + '...');
        
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
        
        console.log('Card element created, attempting to mount...');
        
        // Check if container exists
        const cardContainer = document.getElementById('card-element');
        if (!cardContainer) {
            console.error('Card element container #card-element not found in DOM');
            return;
        }
        
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
        
        cardElement.on('ready', () => {
            console.log('Stripe card element is ready and interactive');
        });
        
        console.log('Stripe initialized successfully');
    } catch (error) {
        console.error('Error initializing Stripe:', error);
        alert('Failed to initialize payment system: ' + error.message);
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
    
    // Use discounted price if discount is applied, otherwise use original price
    const priceToCharge = isDiscountApplied ? finalPrice : pkg.price;
    const amountInPence = Math.round(priceToCharge * 100); // Convert to pence and round to avoid decimal issues
    
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
                    discountApplied: isDiscountApplied,
                    discountCode: isDiscountApplied ? VALID_DISCOUNT_CODE : 'none',
                    originalPrice: originalPrice,
                    discountAmount: currentDiscountAmount,
                    finalPrice: priceToCharge,
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
