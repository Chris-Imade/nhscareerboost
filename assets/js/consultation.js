// Consultation/Checkout Page JavaScript
const API_BASE_URL = 'https://nhscareerboost-server.onrender.com';
const API_ENDPOINT = `${API_BASE_URL}/api/contact`;

document.addEventListener('DOMContentLoaded', function() {
    console.log('Consultation page loaded');
    
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

    // Stripe payment simulation
    if (stripePayBtn) {
        stripePayBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Show loading state
            stripePayBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
            stripePayBtn.disabled = true;

            // Simulate payment processing
            setTimeout(function() {
                // Hide payment section
                paymentSection.style.display = 'none';
                
                // Show success message
                successSection.style.display = 'block';
                
                // After 3 seconds, show details form
                setTimeout(function() {
                    successSection.style.display = 'none';
                    detailsFormSection.style.display = 'block';
                    
                    // Generate transaction reference
                    const transactionRef = 'TXN' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
                    document.getElementById('transaction-ref').value = transactionRef;
                }, 3000);
            }, 2000);
        });
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
                message: `Transaction Ref: ${data.transaction_ref || 'N/A'}\n` +
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
