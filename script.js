// ==========================================
// 1. Mobile Menu Toggle & UX Enhancements
// ==========================================
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');
const iconOpen = document.getElementById('menuIconOpen');
const iconClose = document.getElementById('menuIconClose');

if (menuBtn && mobileMenu) {
  const toggleMenu = () => {
    const isHidden = mobileMenu.classList.toggle('hidden');
    mobileMenu.classList.toggle('flex', !isHidden);
    
    if (iconOpen && iconClose) {
      iconOpen.classList.toggle('hidden');
      iconClose.classList.toggle('hidden');
    }
  };

  menuBtn.addEventListener('click', toggleMenu);

  // Close menu when pressing Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
      toggleMenu();
    }
  });

  // Close menu when clicking a link inside it
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (!mobileMenu.classList.contains('hidden')) toggleMenu();
    });
  });
}

// ==========================================
// 2. EmailJS Booking Form Handler
// ==========================================
// Safely initialize EmailJS once loaded
if (typeof emailjs !== 'undefined') {
  emailjs.init("O6y2mykP0LcqoP5Pa");
} else {
  console.error("EmailJS SDK failed to load. Check script inclusion.");
}

const bookingForm = document.getElementById('bookingForm');

if (bookingForm) {
  bookingForm.addEventListener('submit', function(event) {
    event.preventDefault();

    if (typeof emailjs === 'undefined') {
      alert('Email service is currently unavailable. Please contact us directly.');
      return;
    }

    const form = this;
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton ? submitButton.textContent : 'Submit';

    // Set UI Loading State
    if (submitButton) {
      submitButton.textContent = "Sending...";
      submitButton.disabled = true;
    }

    const serviceID = 'service_1zoxixh';
    const templateID = 'template_bund6lm';

    emailjs.sendForm(serviceID, templateID, form)
      .then((response) => {
        console.log('SUCCESS!', response.status, response.text);
        alert('Thank you! Your booking request has been sent successfully.');
        form.reset(); // Clear form fields
      })
      .catch((error) => {
        console.error('FAILED...', error);
        alert('Failed to send booking request. Please try again or contact us directly.');
      })
      .finally(() => {
        // Reset button state regardless of outcome
        if (submitButton) {
          submitButton.textContent = originalButtonText;
          submitButton.disabled = false;
        }
      });
  });
}
