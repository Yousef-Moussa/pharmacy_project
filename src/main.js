


// FEATURED SLIDER
const capsules = document.querySelectorAll(".capsuleCard"); // Bug 1: was missing the dot
const WINDOW_SIZE = 4; // how many cards visible at once
let startIndex = 0;
let intervalId = null;

document.addEventListener("DOMContentLoaded", initializeCapsules);

function initializeCapsules() {
  if (capsules.length > WINDOW_SIZE) { // Bug 2: was comparing NodeList, not .length
    showWindow();
    intervalId = setInterval(nextCapsule, 6000);
  }
}

function showWindow() {
  capsules.forEach((card, i) => {
    if (i >= startIndex && i < startIndex + WINDOW_SIZE) {
      card.classList.add("displayCapsule");
    } else {
      card.classList.remove("displayCapsule");
    }
  });
}

function nextCapsule() {
  // Bug 3: wrap around to start when reaching the end
  if (startIndex + WINDOW_SIZE < capsules.length) {
    startIndex++;
  } else {
    startIndex = 0;
  }
  showWindow();
}

function prevCapsule() {
  // Wrap around to end when going before the start
  if (startIndex > 0) {
    startIndex--;
  } else {
    startIndex = capsules.length - WINDOW_SIZE;
  }
  showWindow();
}

function resetInterval() {
  clearInterval(intervalId);
  intervalId = setInterval(nextCapsule, 6000);
}

// Bug 4: buttons had no event listeners attached
document.querySelector(".leftSlider").addEventListener("click", () => {
  prevCapsule();
  resetInterval(); // Bug 5: manual clicks must reset the timer
});

document.querySelector(".rightSlider").addEventListener("click", () => {
  nextCapsule();
  resetInterval();
});






// Search bar
 const searchBox = document.getElementById("searchBox");


    searchBox.addEventListener("keydown", (event) => {
        if(event.key === "Enter"){
            console.log(searchBox.value);
        }
    });



// keeping the current page on reload
window.addEventListener('load', ()=>{
    const savedPage = localStorage.getItem('pageToShow') || 'homePageNotLogined';
    replaceDivs(savedPage);
});



//Pages traversal (DOM manipulation)
function replaceDivs(pageToShow){
    const pages = ["loginPage","signUpPage","homePageNotLogined"]

    for(const page of pages){
    document.getElementById(page).style.display = "none";
    }
    
    document.getElementById(pageToShow).style.display = "block";
    localStorage.setItem('pageToShow', pageToShow);
}

window.replaceDivs = replaceDivs;

