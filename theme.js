/* Apply the saved theme before first paint so there is no flash.
   Values: device | dark | light. "device" resolves through the OS
   colour scheme; the resolved colours live in styles.css.

   The storage key is shared with the nitrox parent site on purpose:
   nitroxhq.github.io and nitroxhq.github.io/tesseract are the same
   origin, so one preference follows the visitor across the brand. */
(function () {
  var theme = 'device';
  try {
    var saved = localStorage.getItem('nitrox-theme');
    if (saved === 'device' || saved === 'dark' || saved === 'light') {
      theme = saved;
    }
  } catch (error) {
    /* storage can throw in private modes; the default still works */
  }
  document.documentElement.dataset.theme = theme;
})();
