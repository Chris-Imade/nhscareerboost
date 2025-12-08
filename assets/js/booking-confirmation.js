// Booking Confirmation Page JavaScript with Calendar Integration

document.addEventListener("DOMContentLoaded", function () {
  console.log("Booking confirmation page loaded");

  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const service = urlParams.get("service");
  const date = urlParams.get("date");
  const time = urlParams.get("time");
  const name = urlParams.get("name");
  const email = urlParams.get("email");

  // Check if appointment details are present
  if (service && date && time && name) {
    console.log("Appointment details found:", { service, date, time, name });

    // Display appointment details
    displayAppointmentDetails(service, date, time, name);

    // Store details for calendar integration
    window.appointmentDetails = {
      service: service,
      date: date,
      time: time,
      name: name,
      email: email,
    };

    // Show calendar section
    const calendarSection = document.getElementById("calendar-section");
    if (calendarSection) {
      calendarSection.style.display = "block";
    }

    // Setup calendar button event listeners
    setupCalendarButtons();
  } else {
    console.log("No appointment details in URL parameters");
  }
});

/**
 * Display appointment details on the page
 */
function displayAppointmentDetails(service, date, time, name) {
  // Format date for display
  const dateObj = new Date(date);
  const formattedDate = dateObj.toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Format time for display
  const [hours, minutes] = time.split(":");
  const timeObj = new Date();
  timeObj.setHours(parseInt(hours), parseInt(minutes));
  const formattedTime = timeObj.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Update DOM elements
  document.getElementById("detail-service").textContent = service;
  document.getElementById("detail-date").textContent = formattedDate;
  document.getElementById("detail-time").textContent = formattedTime;
  document.getElementById("detail-name").textContent = name;

  // Show appointment details section
  const appointmentDetails = document.getElementById("appointment-details");
  if (appointmentDetails) {
    appointmentDetails.style.display = "block";
  }
}

/**
 * Setup calendar button event listeners
 */
function setupCalendarButtons() {
  const googleCalendarBtn = document.getElementById("add-google-calendar");
  const appleCalendarBtn = document.getElementById("add-apple-calendar");

  if (googleCalendarBtn) {
    googleCalendarBtn.addEventListener("click", function () {
      if (window.appointmentDetails) {
        addToGoogleCalendar(window.appointmentDetails);
      } else {
        alert("Appointment details not found. Please contact support.");
      }
    });
  }

  if (appleCalendarBtn) {
    appleCalendarBtn.addEventListener("click", function () {
      if (window.appointmentDetails) {
        addToAppleCalendar(window.appointmentDetails);
      } else {
        alert("Appointment details not found. Please contact support.");
      }
    });
  }
}

// ============================================
// CALENDAR INTEGRATION FUNCTIONS
// ============================================

/**
 * Format date and time for calendar events
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} time - Time in HH:MM format
 * @returns {object} - Formatted start and end dates
 */
function formatCalendarDateTime(date, time) {
  // Combine date and time
  const dateTimeString = `${date}T${time}:00`;
  const startDate = new Date(dateTimeString);

  // Set end time to 1 hour after start (default consultation duration)
  const endDate = new Date(startDate);
  endDate.setHours(endDate.getHours() + 1);

  return { startDate, endDate };
}

/**
 * Format date for Google Calendar (yyyyMMddTHHmmss format)
 * @param {Date} date - JavaScript Date object
 * @returns {string} - Formatted date string
 */
function formatGoogleCalendarDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

/**
 * Add appointment to Google Calendar
 * @param {object} details - Appointment details
 */
function addToGoogleCalendar(details) {
  const { startDate, endDate } = formatCalendarDateTime(
    details.date,
    details.time
  );

  const title = encodeURIComponent(`Health Career Boost - ${details.service}`);
  const description = encodeURIComponent(
    `Your Health Career Boost consultation for ${details.service}.\n\n` +
      `Contact: daniel@healthcareerboost.co.uk\n` +
      `Phone: 01604 908464\n\n` +
      `Please ensure you have all relevant documents ready for the session.`
  );
  const location = encodeURIComponent(
    "Online (Details will be sent via email)"
  );

  const startTime = formatGoogleCalendarDate(startDate);
  const endTime = formatGoogleCalendarDate(endDate);

  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTime}/${endTime}&details=${description}&location=${location}`;

  // Open in new tab
  window.open(googleCalendarUrl, "_blank");

  console.log("Google Calendar link opened");
}

/**
 * Format date for iCalendar (yyyyMMddTHHmmssZ format in UTC)
 * @param {Date} date - JavaScript Date object
 * @returns {string} - Formatted date string in UTC
 */
function formatICalDate(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");

  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Add appointment to Apple Calendar (iCal format)
 * @param {object} details - Appointment details
 */
function addToAppleCalendar(details) {
  const { startDate, endDate } = formatCalendarDateTime(
    details.date,
    details.time
  );

  const now = new Date();
  const dtstamp = formatICalDate(now);
  const dtstart = formatICalDate(startDate);
  const dtend = formatICalDate(endDate);

  // Generate a unique ID for the event
  const uid = `nhs-career-boost-${Date.now()}@healthcareerboost.co.uk`;

  // Create iCalendar format
  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Health Career Boost//Consultation Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:Health Career Boost - ${details.service}`,
    `DESCRIPTION:Your Health Career Boost consultation for ${details.service}.\\n\\nContact: daniel@healthcareerboost.co.uk\\nPhone: 01604 908464\\n\\nPlease ensure you have all relevant documents ready for the session.`,
    "LOCATION:Online (Details will be sent via email)",
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "BEGIN:VALARM",
    "TRIGGER:-PT30M",
    "DESCRIPTION:Reminder: Health Career Boost consultation in 30 minutes",
    "ACTION:DISPLAY",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  // Create blob and download
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = `nhs-career-boost-${details.service
    .toLowerCase()
    .replace(/\s+/g, "-")}.ics`;

  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up
  window.URL.revokeObjectURL(link.href);

  console.log("iCal file downloaded");
}
