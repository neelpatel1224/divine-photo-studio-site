/**
 * DIVINE PHOTO STUDIO — Contact Page Interactions
 * Handles form validation, accessible error announcements,
 * and an honest unavailable state until a backend is connected.
 */

document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contact-form');
  const confirmationBlock = document.getElementById('contact-confirmation');
  const submitBtn = document.getElementById('contact-submit-btn');

  if (!contactForm) return;
  if (submitBtn) submitBtn.disabled = false;

  const fields = {
    name: {
      input: document.getElementById('contact-name'),
      field: document.getElementById('field-name'),
      error: document.getElementById('error-name'),
      validate: (val) => val.trim().length > 0,
      errorMessage: 'Please enter your name.'
    },
    email: {
      input: document.getElementById('contact-email'),
      field: document.getElementById('field-email'),
      error: document.getElementById('error-email'),
      validate: (val) => {
        // Standard accessible email regex check
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
      },
      errorMessage: 'Please enter a valid email address.'
    },
    phone: {
      input: document.getElementById('contact-phone'),
      field: document.getElementById('field-phone'),
      error: document.getElementById('error-phone'),
      validate: (val) => {
        // Must contain at least 7 digits
        const digits = val.replace(/\D/g, '');
        return digits.length >= 7;
      },
      errorMessage: 'Please enter a valid phone number.'
    }
  };

  // Clear errors dynamically on input
  Object.keys(fields).forEach((key) => {
    const item = fields[key];
    if (item.input) {
      item.input.addEventListener('input', () => {
        if (item.field.classList.contains('contact-form__field--error')) {
          if (item.validate(item.input.value)) {
            item.field.classList.remove('contact-form__field--error');
            item.input.removeAttribute('aria-invalid');
            if (item.error) item.error.textContent = '';
          }
        }
      });
    }
  });

  // Handle Form Submission
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let hasError = false;
    let firstErrorInput = null;

    // Validate each required field
    Object.keys(fields).forEach((key) => {
      const item = fields[key];
      const val = item.input ? item.input.value : '';
      const isValid = item.validate(val);

      if (!isValid) {
        hasError = true;
        if (item.field) item.field.classList.add('contact-form__field--error');
        if (item.input) item.input.setAttribute('aria-invalid', 'true');
        if (item.error) item.error.textContent = item.errorMessage;
        if (!firstErrorInput && item.input) {
          firstErrorInput = item.input;
        }
      } else {
        if (item.field) item.field.classList.remove('contact-form__field--error');
        if (item.input) item.input.removeAttribute('aria-invalid');
        if (item.error) item.error.textContent = '';
      }
    });

    if (hasError) {
      if (firstErrorInput) {
        firstErrorInput.focus();
      }
      return;
    }

    // TODO: Connect a verified backend before enabling production submission.
    // Keep the enquiry in the form; never log personal data or claim it was sent.
    if (confirmationBlock) {
      confirmationBlock.hidden = false;
      confirmationBlock.setAttribute('role', 'status');
      confirmationBlock.textContent = 'Your enquiry has not been sent. Online booking is not connected yet. Verified direct contact details will be added when available.';
    }
  });
});
