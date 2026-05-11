


//signUp/Login
function replaceDivs(pageToShow){
    const pages = ["loginPage","signUpPage","homePageNotLogined"]

    for(const page of pages){
    document.getElementById(page).style.display = "none";
    }
    
    document.getElementById(pageToShow).style.display = "block";
}

window.replaceDivs = replaceDivs;

