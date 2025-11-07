// Consultation/Checkout Page JavaScript
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
        detailsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(detailsForm);
            const data = Object.fromEntries(formData.entries());
            
            console.log('Form submitted:', data);
            
            // Show success message
            alert('Thank you! Your booking has been confirmed. You will receive a confirmation email shortly at ' + data.email);
            
            // Optionally redirect
            // window.location.href = 'index.html';
        });
    }
});
