/**
 * Zoho Booking Modal System
 * Handles free consultation booking modals across the NHS Career Boost website
 */

(function() {
    'use strict';

    // Modal HTML template
    const modalHTML = `
        <div id="zohoBookingModal" class="zoho-modal" role="dialog" aria-labelledby="modalTitle" aria-modal="true">
            <div class="zoho-modal-overlay" aria-hidden="true"></div>
            <div class="zoho-modal-container">
                <div class="zoho-modal-content">
                    <button class="zoho-modal-close" aria-label="Close modal" title="Close">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                    <div class="zoho-modal-header">
                        <h2 id="modalTitle">Book Your Free 15-Minute Consultation</h2>
                        <p>Choose a convenient time for your free CV audit and career consultation</p>
                    </div>
                    <div class="zoho-modal-body">
                        <iframe 
                            width="100%" 
                            height="750px" 
                            src="https://nhscareerboost.zohobookings.com/portal-embed#/4780458000000052050" 
                            frameborder="0" 
                            allowfullscreen
                            title="Zoho Booking Calendar"
                            loading="lazy">
                        </iframe>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Modal CSS styles
    const modalStyles = `
        <style id="zohoModalStyles">
            .zoho-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 99999;
                display: none;
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .zoho-modal.active {
                display: block;
            }

            .zoho-modal.show {
                opacity: 1;
            }

            .zoho-modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.75);
                backdrop-filter: blur(4px);
                animation: fadeIn 0.3s ease;
            }

            .zoho-modal-container {
                position: relative;
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                overflow-y: auto;
                animation: slideUp 0.4s ease;
            }

            .zoho-modal-content {
                position: relative;
                background: #ffffff;
                border-radius: 16px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                max-width: 900px;
                width: 100%;
                max-height: 95vh;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }

            .zoho-modal-close {
                position: absolute;
                top: 20px;
                right: 20px;
                width: 40px;
                height: 40px;
                border: none;
                background: rgba(0, 0, 0, 0.05);
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                z-index: 10;
                color: #333;
            }

            .zoho-modal-close:hover {
                background: #005EB8;
                color: white;
                transform: rotate(90deg);
            }

            .zoho-modal-close:focus {
                outline: 2px solid #005EB8;
                outline-offset: 2px;
            }

            .zoho-modal-header {
                padding: 40px 30px 20px;
                text-align: center;
                border-bottom: 1px solid #e5e7eb;
            }

            .zoho-modal-header h2 {
                font-size: 28px;
                font-weight: 700;
                color: #1a1a1a;
                margin: 0 0 10px 0;
                line-height: 1.3;
            }

            .zoho-modal-header p {
                font-size: 16px;
                color: #666;
                margin: 0;
                line-height: 1.5;
            }

            .zoho-modal-body {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
                background: #f9fafb;
            }

            .zoho-modal-body iframe {
                width: 100%;
                min-height: 750px;
                border: none;
                border-radius: 8px;
                background: white;
            }

            /* Animations */
            @keyframes fadeIn {
                from {
                    opacity: 0;
                }
                to {
                    opacity: 1;
                }
            }

            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            /* Mobile Responsive Styles */
            @media (max-width: 768px) {
                .zoho-modal-container {
                    padding: 10px;
                    align-items: flex-start;
                }

                .zoho-modal-content {
                    border-radius: 12px;
                    max-height: 100vh;
                    margin: 10px 0;
                }

                .zoho-modal-header {
                    padding: 50px 20px 15px;
                }

                .zoho-modal-header h2 {
                    font-size: 22px;
                }

                .zoho-modal-header p {
                    font-size: 14px;
                }

                .zoho-modal-close {
                    top: 15px;
                    right: 15px;
                    width: 36px;
                    height: 36px;
                }

                .zoho-modal-body {
                    padding: 15px;
                }

                .zoho-modal-body iframe {
                    min-height: 600px;
                }
            }

            @media (max-width: 480px) {
                .zoho-modal-container {
                    padding: 0;
                }

                .zoho-modal-content {
                    border-radius: 0;
                    max-height: 100vh;
                    height: 100vh;
                    margin: 0;
                }

                .zoho-modal-header h2 {
                    font-size: 20px;
                }

                .zoho-modal-body iframe {
                    min-height: 500px;
                }
            }

            /* Prevent body scroll when modal is open */
            body.modal-open {
                overflow: hidden;
                padding-right: var(--scrollbar-width, 0);
            }

            /* Loading state */
            .zoho-modal-body::before {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 40px;
                height: 40px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid #005EB8;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                z-index: 1;
            }

            .zoho-modal-body iframe {
                position: relative;
                z-index: 2;
            }

            @keyframes spin {
                0% { transform: translate(-50%, -50%) rotate(0deg); }
                100% { transform: translate(-50%, -50%) rotate(360deg); }
            }
        </style>
    `;

    // Initialize modal
    function initModal() {
        // Check if modal already exists
        if (document.getElementById('zohoBookingModal')) {
            return;
        }

        // Add styles to head
        if (!document.getElementById('zohoModalStyles')) {
            document.head.insertAdjacentHTML('beforeend', modalStyles);
        }

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Get modal elements
        const modal = document.getElementById('zohoBookingModal');
        const closeBtn = modal.querySelector('.zoho-modal-close');
        const overlay = modal.querySelector('.zoho-modal-overlay');

        // Close modal function
        function closeModal() {
            modal.classList.remove('show');
            document.body.classList.remove('modal-open');
            
            setTimeout(() => {
                modal.classList.remove('active');
            }, 300);

            // Remove focus trap
            document.removeEventListener('keydown', handleKeyDown);
        }

        // Open modal function
        function openModal() {
            // Calculate scrollbar width
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);

            modal.classList.add('active');
            document.body.classList.add('modal-open');
            
            setTimeout(() => {
                modal.classList.add('show');
            }, 10);

            // Set focus to close button
            closeBtn.focus();

            // Add focus trap
            document.addEventListener('keydown', handleKeyDown);
        }

        // Handle keyboard events
        function handleKeyDown(e) {
            // Close on Escape key
            if (e.key === 'Escape') {
                closeModal();
            }

            // Trap focus within modal
            if (e.key === 'Tab') {
                const focusableElements = modal.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        }

        // Event listeners
        closeBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', closeModal);

        // Attach to all free consultation buttons
        attachToButtons(openModal);
    }

    // Attach modal to buttons
    function attachToButtons(openModal) {
        // Find all buttons/links with "free" in the text
        const selectors = [
            'a[href*="consultation"]',
            'button',
            '.ht-btn'
        ];

        document.querySelectorAll(selectors.join(', ')).forEach(element => {
            const text = element.textContent.toLowerCase();
            
            // Check if button contains "free" and "book" or "consultation"
            if (text.includes('free') && (text.includes('book') || text.includes('consultation') || text.includes('audit'))) {
                // Prevent default link behavior
                element.addEventListener('click', function(e) {
                    e.preventDefault();
                    openModal();
                });

                // Add visual indicator (optional)
                element.style.cursor = 'pointer';
            }
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initModal);
    } else {
        initModal();
    }

    // Re-attach to buttons after dynamic content loads
    window.addEventListener('load', function() {
        setTimeout(initModal, 500);
    });

    // Expose public API
    window.ZohoBookingModal = {
        open: function() {
            const modal = document.getElementById('zohoBookingModal');
            if (modal) {
                const event = new Event('click');
                modal.querySelector('.zoho-modal-close').dispatchEvent(event);
            } else {
                initModal();
                setTimeout(() => {
                    const modal = document.getElementById('zohoBookingModal');
                    if (modal) {
                        modal.classList.add('active', 'show');
                        document.body.classList.add('modal-open');
                    }
                }, 100);
            }
        },
        close: function() {
            const modal = document.getElementById('zohoBookingModal');
            if (modal && modal.classList.contains('active')) {
                modal.querySelector('.zoho-modal-close').click();
            }
        }
    };

})();
