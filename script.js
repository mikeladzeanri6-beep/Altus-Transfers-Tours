// ==========================================
// 2. EmailJS Booking Form Handler
// ==========================================
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
    if (!submitButton) return;

    // Cache original content/classes for smooth reset
    const originalText = submitButton.innerHTML;
    
    // 1. Set Loading State
    submitButton.disabled = true;
    submitButton.classList.add('opacity-80', 'cursor-not-allowed');
    submitButton.innerHTML = `
      <span class="inline-flex items-center gap-2">
        <svg class="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
        Sending...
      </span>
    `;

    const serviceID = 'service_1zoxixh';
    const templateID = 'template_bund6lm';

    emailjs.sendForm(serviceID, templateID, form)
      .then((response) => {
        console.log('SUCCESS!', response.status, response.text);

        // 2. Set Success State (Green Button)
        submitButton.classList.remove('opacity-80', 'cursor-not-allowed');
        
        // Tailwind classes for success (Emerald green + smooth transition)
        submitButton.classList.add('bg-emerald-600', 'hover:bg-emerald-700', 'text-white', 'border-emerald-600');
        
        submitButton.innerHTML = `
          <span class="inline-flex items-center gap-2">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
            Inquiry Sent!
          </span>
        `;

        form.reset(); // Clear form inputs

        // 3. Reset Button Back to Idle after 4 Seconds
        setTimeout(() => {
          submitButton.classList.remove('bg-emerald-600', 'hover:bg-emerald-700', 'border-emerald-600');
          submitButton.innerHTML = originalText;
          submitButton.disabled = false;
        }, 4000);

      })
      .catch((error) => {
        console.error('FAILED...', error);

        // Error State
        submitButton.classList.remove('opacity-80', 'cursor-not-allowed');
        submitButton.classList.add('bg-rose-600', 'text-white');
        submitButton.innerHTML = 'Failed to send. Try again.';

        setTimeout(() => {
          submitButton.classList.remove('bg-rose-600');
          submitButton.innerHTML = originalText;
          submitButton.disabled = false;
        }, 3000);
      });
  });
}
