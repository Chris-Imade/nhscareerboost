/**
 * Health Career Boost - Contact Form Handler
 * Handles form submission to backend API
 */

const API_BASE_URL = "https://nhscareerboost-server.onrender.com";
const API_ENDPOINT = `${API_BASE_URL}/api/contact`;

document.addEventListener("DOMContentLoaded", function () {
  const contactForm = document.getElementById("contactForm");
  const submitBtn = document.getElementById("submitBtn");
  const formStatus = document.getElementById("formStatus");

  if (!contactForm) return;

  contactForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Disable submit button and show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";
    formStatus.innerHTML = "";

    // Collect form data
    const selectedService = document.querySelector(
      'input[name="service"]:checked'
    );
    const formData = {
      name: document.getElementById("name").value.trim(),
      email: document.getElementById("email").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      service: selectedService ? selectedService.value : "",
      message: document.getElementById("message").value.trim(),
    };

    // Remove phone if empty (it's optional)
    if (!formData.phone) {
      delete formData.phone;
    }

    // Remove message if empty (it's optional)
    if (!formData.message) {
      delete formData.message;
    }

    try {
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Success
        showStatus("success", "✅ Thank you! We will get back to you shortly.");
        contactForm.reset();

        // Optional: Scroll to success message
        formStatus.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        // Error from server
        const errors =
          data.errors?.map((e) => e.message).join("<br>") || data.message;
        showStatus("error", "❌ Error: " + errors);
      }
    } catch (error) {
      // Network error
      console.error("Network error:", error);
      showStatus(
        "error",
        "❌ Network error. Please check your connection and try again."
      );
    } finally {
      // Re-enable submit button
      submitBtn.disabled = false;
      submitBtn.textContent = "SEND MESSAGE HERE";
    }
  });

  /**
   * Display status message
   * @param {string} type - 'success' or 'error'
   * @param {string} message - Message to display
   */
  function showStatus(type, message) {
    const statusClass = type === "success" ? "alert-success" : "alert-danger";
    formStatus.innerHTML = `
            <div class="alert ${statusClass}" role="alert" style="margin-top: 20px; padding: 15px; border-radius: 8px;">
                ${message}
            </div>
        `;
  }

  // Client-side validation enhancement
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");

  // Email validation
  emailInput.addEventListener("blur", function () {
    const email = this.value.trim();
    if (email && !isValidEmail(email)) {
      this.setCustomValidity("Please enter a valid email address");
    } else {
      this.setCustomValidity("");
    }
  });

  // Phone validation (UK format preferred)
  phoneInput.addEventListener("blur", function () {
    const phone = this.value.trim();
    if (phone && phone.length > 0 && (phone.length < 10 || phone.length > 20)) {
      this.setCustomValidity(
        "Phone number must be between 10 and 20 characters"
      );
    } else {
      this.setCustomValidity("");
    }
  });

  /**
   * Validate email format
   * @param {string} email
   * @returns {boolean}
   */
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
});
