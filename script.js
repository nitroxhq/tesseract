var i = 0;
var txt = 'Lorem ipsum typing effect!';
var speed = 50;
/*
function typeWriter() {
  if (i < txt.length) {
    document.getElementById("typeWriter").innerHTML += txt.charAt(i);
    i++;
    setTimeout(typeWriter, speed);
  }
}
typeWriter();
*/

document.addEventListener('DOMContentLoaded', function() {
  // the very first phrase is already placed in the HTML
  // (<span id="typeWriter">productivity supertool.</span>), so
  // we do not include it in the array.  Typed.js will erase the
  // existing text once the animation begins, then cycle through the
  // list below indefinitely.

  var typed = new Typed('#typeWriter', {
    strings: [
      'idea inbox.',
      'focus frontier.',
      'study space.',
      'creativity catalyst.',
      'productivity supertool.'
    ],
    typeSpeed: 40,
    backSpeed: 25,
    backDelay: 3000,
    /* startDelay: 1000,   // keeps the HTML text visible briefly */
    loop: true,
    showCursor: true,
    cursorChar: '|'
  });
});

