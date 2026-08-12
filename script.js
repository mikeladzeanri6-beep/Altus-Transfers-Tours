const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const iconOpen = document.getElementById('menuIconOpen');
  const iconClose = document.getElementById('menuIconClose');
  menuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
    mobileMenu.classList.toggle('flex');
    iconOpen.classList.toggle('hidden');
    iconClose.classList.toggle('hidden');
  });

  
(function() {
 
  emailjs.init("O6y2mykP0LcqoP5Pa");
})();

document.getElementById('bookingForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const form = this;
  const submitButton = form.querySelector('button[type="submit"]');
  const originalButtonText = submitButton.textContent;
  
  
  submitButton.textContent = "Sending...";
  submitButton.disabled = true;

  
  const serviceID = 'service_1zoxixh';
  const templateID = 'template_bund6lm';

  
  emailjs.sendForm(serviceID, templateID, form)
    .then(()
