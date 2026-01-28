// NHS Shortlisting Guide - Stripe Payment Integration
// Main Product: NHS Shortlisting Guide - £9.99

// http://localhost:3000/ - dev-server URL
// https://nhscareerboost-server-ddy9.onrender.com - deployment URL

const API_BASE_URL = 'http://localhost:3000';
const PAYMENT_API_ENDPOINT = `${API_BASE_URL}/api/payment/create-payment-intent`;
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51RMAlgD8x0lOeX6HcgBqcnHpdaHQQbg24qCPtLRKCyYgB7MyJvVqWq13VMgVjX3RsrdLhA5FF6tK0A3v4Bel3kay00HCDCzJc1';

// STRIPE_PUBLIC_KEY=pk_test_51RMAlgD8x0lOeX6HcgBqcnHpdaHQQbg24qCPtLRKCyYgB7MyJvVqWq13VMgVjX3RsrdLhA5FF6tK0A3v4Bel3kay00HCDCzJc1
// STRIPE_PK_LIVE=pk_live_51RMAlgD8x0lOeX6HLILfE2zN253AsQrw77myCQ6gMKhMMiVJnUeFM92tyJZzs1Wn8ZOOTZJkknp6O9FswR2fgBIW00ifi8zHaG

let stripe = null;
let cardElement = null;

// Order bump state
let isUpsellSelected = false;
const MAIN_PRODUCT_PRICE = 9.99;
const UPSELL_PRICE = 39;

document.addEventListener('DOMContentLoaded', function() {
    console.log('NHS Guide checkout page loaded');
    
    // Initialize Stripe
    initializeStripe();
    
    // Get CTA buttons
    const ctaButtonTop = document.getElementById('cta-button-top');
    const ctaButtonBottom = document.getElementById('cta-button-bottom');
    
    // Add click handlers to both CTA buttons - open modal
    if (ctaButtonTop) {
        ctaButtonTop.addEventListener('click', openPaymentModal);
    }
    
    if (ctaButtonBottom) {
        ctaButtonBottom.addEventListener('click', openPaymentModal);
    }
    
    // Setup order bump checkboxes
    setupOrderBump();
    
    // Close modal handlers
    const closeBtn = document.getElementById('close-payment-modal');
    const modal = document.getElementById('payment-modal');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.classList.remove('active');
        });
    }
    
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }
    
    // Handle payment form submission
    const paymentForm = document.getElementById('stripe-payment-form');
    if (paymentForm) {
        paymentForm.addEventListener('submit', handleStripePayment);
    }
});

function setupOrderBump() {
    const checkboxTop = document.getElementById('upsell-checkbox-top');
    const checkboxBottom = document.getElementById('upsell-checkbox');
    const ctaTextTop = document.getElementById('cta-text-top');
    const ctaTextBottom = document.getElementById('cta-text-bottom');
    
    // Sync checkboxes
    function syncCheckboxes(sourceCheckbox, targetCheckbox) {
        if (targetCheckbox) {
            targetCheckbox.checked = sourceCheckbox.checked;
        }
        isUpsellSelected = sourceCheckbox.checked;
        updateCTAText();
    }
    
    function updateCTAText() {
        const totalPrice = isUpsellSelected ? (MAIN_PRODUCT_PRICE + UPSELL_PRICE).toFixed(2) : MAIN_PRODUCT_PRICE.toFixed(2);
        const newText = `Get ${isUpsellSelected ? 'Bundle' : 'the NHS Shortlisting Guide'} – £${totalPrice}`;
        
        if (ctaTextTop) ctaTextTop.textContent = newText;
        if (ctaTextBottom) ctaTextBottom.textContent = newText;
    }
    
    if (checkboxTop) {
        checkboxTop.addEventListener('change', function() {
            syncCheckboxes(checkboxTop, checkboxBottom);
        });
    }
    
    if (checkboxBottom) {
        checkboxBottom.addEventListener('change', function() {
            syncCheckboxes(checkboxBottom, checkboxTop);
        });
    }
}

function initializeStripe() {
    try {
        if (typeof Stripe === 'undefined') {
            console.error('Stripe.js not loaded');
            alert('Payment system could not load. Please check your internet connection.');
            return;
        }
        
        console.log('Initializing Stripe...');
        stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
        const elements = stripe.elements();
        
        // Create card element
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
                    color: '#dc3545',
                    iconColor: '#dc3545',
                },
            },
        });
        
        // Mount card element
        const cardContainer = document.getElementById('card-element');
        if (cardContainer) {
            cardElement.mount('#card-element');
        }
        
        // Handle real-time validation errors
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
        alert('Failed to initialize payment system: ' + error.message);
    }
}

function openPaymentModal(event) {
    event.preventDefault();
    
    const modal = document.getElementById('payment-modal');
    if (modal) {
        // Update modal price display
        const totalPrice = isUpsellSelected ? (MAIN_PRODUCT_PRICE + UPSELL_PRICE).toFixed(2) : MAIN_PRODUCT_PRICE.toFixed(2);
        const modalAmount = document.getElementById('modal-payment-amount');
        const modalProductName = document.getElementById('selected-product-name');
        const paymentButtonText = document.getElementById('payment-button-text');
        
        if (modalAmount) modalAmount.textContent = totalPrice;
        if (modalProductName) {
            modalProductName.textContent = isUpsellSelected ? 'NHS Guide + Career Audit Bundle' : 'NHS Shortlisting Guide';
        }
        if (paymentButtonText) {
            paymentButtonText.textContent = `Pay £${totalPrice}`;
        }
        
        modal.classList.add('active');
        
        // Re-mount card element to ensure it's visible
        if (stripe && cardElement) {
            cardElement.unmount();
            setTimeout(() => {
                cardElement.mount('#card-element');
            }, 100);
        }
    }
}

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
    
    // Product details - calculate based on upsell selection
    let productName = 'NHS Shortlisting Guide';
    let price = MAIN_PRODUCT_PRICE;
    let amountInPence = Math.round(MAIN_PRODUCT_PRICE * 100);
    
    if (isUpsellSelected) {
        productName = 'NHS Shortlisting Guide + Personal NHS Career Audit';
        price = MAIN_PRODUCT_PRICE + UPSELL_PRICE;
        amountInPence = Math.round(price * 100);
    }
    
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
                    service: productName,
                    serviceKey: 'nhs-shortlisting-guide',
                    timestamp: new Date().toISOString(),
                    type: 'digital-download',
                    upsellIncluded: String(isUpsellSelected),
                    mainProduct: 'NHS Shortlisting Guide',
                    mainProductPrice: String(MAIN_PRODUCT_PRICE),
                    upsellProduct: isUpsellSelected ? 'Personal NHS Career Audit' : 'none',
                    upsellPrice: String(isUpsellSelected ? UPSELL_PRICE : 0)
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
            // Payment failed
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
    // Redirect to success page with upsell info
    const successUrl = `/nhs-shortlisting-guide/thank-you.html?payment_intent=${paymentIntent.id}&upsell=${isUpsellSelected}`;
    window.location.href = successUrl;
}
