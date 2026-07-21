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
    .then(() => {
     
      submitButton.textContent = "Inquiry Sent!";
      submitButton.style.backgroundColor = "#4ADE80"; 
      submitButton.style.color = "#000000";
      
      alert('Thank you! Your inquiry has been sent successfully.');
      form.reset(); 
    })
    .catch((error) => {
     
      alert('Oops! Something went wrong. Please check your connection and try again.');
      console.error('EmailJS Error:', error);
    })
    .finally(() => {
      
      setTimeout(() => {
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
        submitButton.style.backgroundColor = ""; 
        submitButton.style.color = "";
      }, 3000);
    });
});