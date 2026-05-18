
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

