// MANAM Live Invitation Previewer Engine

document.addEventListener('DOMContentLoaded', () => {
  initInvitationPreviewer();
});

function initInvitationPreviewer() {
  // Input elements
  const inputGroom = document.getElementById('input-groom');
  const inputBride = document.getElementById('input-bride');
  const inputDate = document.getElementById('input-date');
  const inputVenue = document.getElementById('input-venue');
  
  // Preview elements
  const previewGroom = document.getElementById('preview-groom');
  const previewBride = document.getElementById('preview-bride');
  const previewDay = document.getElementById('preview-date-day');
  const previewMonth = document.getElementById('preview-date-month');
  const previewVenue = document.getElementById('preview-venue');
  const phoneScreen = document.getElementById('phone-screen');

  // Month names helper
  const months = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
  ];

  // Helper function to animate text updates
  function updateTextWithAnimation(element, newText) {
    if (!element || element.textContent === newText) return;
    
    // Quick premium fade out-in transition
    element.style.opacity = '0';
    element.style.transform = 'translateY(5px)';
    element.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
    
    setTimeout(() => {
      element.textContent = newText;
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    }, 250);
  }

  // Bind input: Groom Name
  if (inputGroom) {
    inputGroom.addEventListener('input', (e) => {
      const groomVal = e.target.value.trim() || 'Aaryan';
      updateTextWithAnimation(previewGroom, groomVal);
    });
  }

  // Bind input: Bride Name
  if (inputBride) {
    inputBride.addEventListener('input', (e) => {
      const brideVal = e.target.value.trim() || 'Aanya';
      updateTextWithAnimation(previewBride, brideVal);
    });
  }

  // Bind input: Date
  if (inputDate) {
    inputDate.addEventListener('change', (e) => {
      const dateVal = e.target.value;
      if (dateVal) {
        const dateObj = new Date(dateVal);
        if (!isNaN(dateObj.getTime())) {
          const dayNum = dateObj.getDate().toString().padStart(2, '0');
          const monthText = months[dateObj.getMonth()];
          
          updateTextWithAnimation(previewDay, dayNum);
          updateTextWithAnimation(previewMonth, monthText);
          return;
        }
      }
      // Fallback
      updateTextWithAnimation(previewDay, '18');
      updateTextWithAnimation(previewMonth, 'DECEMBER');
    });
  }

  // Bind input: Venue
  if (inputVenue) {
    inputVenue.addEventListener('input', (e) => {
      const venueVal = e.target.value.trim() || 'The Taj Palace, Udaipur';
      updateTextWithAnimation(previewVenue, venueVal);
    });
  }

  // Expose theme synchronization to the global theme switcher
  window.updateInvitationTheme = function(themeName) {
    if (!phoneScreen) return;

    // Reset phone screen classes
    phoneScreen.className = 'phone-screen';
    
    // Set matching classes
    if (themeName === 'theme-default') {
      phoneScreen.style.backgroundColor = '#0a0a0c';
    } else if (themeName === 'theme-royal') {
      phoneScreen.style.backgroundColor = '#1c050a';
    } else if (themeName === 'theme-celestial') {
      phoneScreen.style.backgroundColor = '#060a16';
    } else if (themeName === 'theme-minimalist') {
      phoneScreen.style.backgroundColor = '#fbfaf8';
    }

    // Trigger a visual ripple inside the phone card on theme shift
    const border = document.querySelector('.invite-border');
    if (border) {
      border.style.transform = 'scale(0.96)';
      border.style.opacity = '0.7';
      setTimeout(() => {
        border.style.transform = 'scale(1)';
        border.style.opacity = '0.4';
      }, 500);
    }
  };
}
