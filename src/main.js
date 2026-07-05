import { createCrypto } from "./utils/storage.js"; // for password encryption


// LOGIN/SIGNUP START

//getting the values form sign up and login.

//password encryption through encrypted module 
const cryptoModule = createCrypto();

//LOGIN
async function getLoginCredentials(){
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const email = document.getElementById("email").value;


  console.log(email,password, username)
  const user = await getUser(email);
  if (!user) {
    window.alert("No account found with that email.");
    return;
  }
  console.log(user);
  const encryptedPassword = user.password


try{
  const decrypted = await cryptoModule.decrypt(user.password, password)

  if(decrypted.email === email && decrypted.username === username){

      replaceDivs("homePageNotLogined");
      document.getElementById("cartBtn").disabled = false;
      document.getElementById("ordersBtn").disabled = false;
      document.getElementById("logOutNav").style.display = "none";
      document.getElementById("logInNav").style.display = "block";
  }
  else{
    window.alert("invalidCredintials.")
  }
}
catch(e){
  window.alert("Error: Decryption failed. Wrong password? ")
}
}
window.getLoginCredentials = getLoginCredentials; // to globalize, as we are using script type="modules" not defer

function logOut(){
  document.getElementById("cartBtn").disabled = true;
  document.getElementById("ordersBtn").disabled = true;
  document.getElementById("logOutNav").style.display = "flex";
  document.getElementById("logInNav").style.display = "none";
  replaceDivs("homePageNotLogined");
}
window.logOut = logOut;


// SIGN UP
function getSignUpCredentials(){
  const email = document.getElementById("registerEmail").value;
  const username = document.getElementById("registerUsername").value;
  const password1 = document.getElementById("registerPassword").value;
  const password2 = document.getElementById("confirmPassword").value;
  let password = null;
try{
  if(password1 === password2 && email && username){
    password = password1;
    replaceDivs("loginPage")
    document.getElementById("registerEmail").value = "";
    document.getElementById("registerUsername").value = "";
    document.getElementById("registerPassword").value = "";
    document.getElementById("confirmPassword").value = "";
  }
  else if(password1 != password2){
      document.getElementById("registerPassword").value = "";
      document.getElementById("confirmPassword").value = "";
      window.alert("Passwords don't match");
      
  }
}
catch(error){
 console.log(error.message);
}


  const userDetails = {email: email, username: username}
  
  cryptoModule.encrypt(userDetails,password)    
    .then(encryptedData => {
        console.log("Encrypted Data:", encryptedData);
        password = encryptedData
        if((password && username && email)!=""){
        addUser({ email: email, username: username, password: password });
  }
    }).catch(error => {
        console.error("Error:", error);
        window.alert("Error: Password must be at least 2 characters")
    });

  
return{
  email,
  username,
  password
  
}
}

window.getSignUpCredentials = getSignUpCredentials; // to globalize, as we are using script type="modules" not defer
// const secret = getSignUpCredentials();
// console.log(secret?.username);
// console.log(secret?.email);
// console.log(secret?.password);


// opening a login/signup database
function credentialsDB(){
  return new Promise((resolve, reject ) => {
    const myRequest = indexedDB.open("credentialsDB",2) // 2 is the version of DB, 1 is to update the database and 2 is to connect normally or creata a database
    
    myRequest.onupgradeneeded = (event) =>{
      const db = event.target.result;
      const myOldVersion = event.oldVersion; // 0 if brand new // tells you the previous version number of the DB

    // if the database doesn't exist VERSION 1
    if(myOldVersion < 1){
      const users = db.createObjectStore("users",{keyPath: "id", autoIncrement: true}) // creating objects with primary keeys
      users.createIndex("by_email","email",{unique: true});
      users.createIndex("by_username","username",{unique: true});
    }  
    // // if database to be updated/extended create version 2 / object 2
    // if(myOldVersion<2){
    //   const posts = db.createObjectStore("posts",
    //     {
    //     keyPath:"postId", autoIncrement:true
    //     }                               );
    //     posts.createIndex("by_author","authorId");
    // }
  }
  myRequest.onsuccess = (e) => resolve(e.target.result); 
  myRequest.onerror   = (e) => reject(e.target.error);   
  });
}

async function addUser(user) {
  const db = await credentialsDB(); // you need to resolve the promise first
  return new Promise((resolve, reject) => {
    const tx    = db.transaction("users", "readwrite");
    const store = tx.objectStore("users");
    const req   = store.add(user); // use put() if you want upsert
    req.onsuccess = (e) => resolve(e.target.result); // returns the generated id
    req.onerror   = (e) => reject(e.target.error);
  });
}

async function getUser(email) {
  const db  = await credentialsDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction("users", "readonly")
                  .objectStore("users")
                  .index("by_email")
                  .get(email);
    req.onsuccess = (e) => {resolve(e.target.result)};
    req.onerror   = (e) => reject(e.target.error);
  });
}


// DELETE
async function deleteUser(id) {
  const db = await credentialsDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction("users", "readwrite").objectStore("users").delete(id);
    req.onsuccess = () => resolve();
    req.onerror   = (e) => reject(e.target.error);
  });
}

// UPDATE
async function updateUser(user) {
  const db = await credentialsDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction("users", "readwrite").objectStore("users").put(user); // must include id
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror   = (e) => reject(e.target.error);
  });
}


window.addEventListener('googleLogin', async (e)=> {
  const myGoogleUser = e.detail;

  const existingUser =  await getUser(myGoogleUser.email);

  if(existingUser){
    console.log("Welcome back: ", existingUser.username);
    replaceDivs("homePageNotLogined");
    document.getElementById("cartBtn").disabled = false;
    document.getElementById("ordersBtn").disabled = false;
    document.getElementById("logOutNav").style.display = "none";
    document.getElementById("logInNav").style.display = "block";
    
  }
  else{
    // adding new user to the DB
    await addUser(
    {
      email: myGoogleUser.email,
      username: myGoogleUser.email,
      password: null,
      picture: myGoogleUser.picture,
      googleId: myGoogleUser.id
    }
    );

    console.log("New google user registered: ", myGoogleUser.name);
    replaceDivs("homePageNotLogined");
    document.getElementById("cartBtn").disabled = false;
    document.getElementById("ordersBtn").disabled = false;
    document.getElementById("logOutNav").style.display = "none";
    document.getElementById("logInNav").style.display = "block";
    
  }

  console.log('user loginned credictials:',myGoogleUser.id,myGoogleUser.email,myGoogleUser.name, myGoogleUser.picture);
  console.log("banana");
  
});






// LOGIN/SIGNUP END




// FEATURED SLIDER START
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

// Event listeners to the buttons
document.querySelector(".leftSlider").addEventListener("click", () => {
  prevCapsule();
  resetInterval(); 
});

document.querySelector(".rightSlider").addEventListener("click", () => {
  nextCapsule();
  resetInterval();
});
// FEATURED SLIDER END





// Search bar START
 const searchBox = document.getElementById("searchBox");


    searchBox.addEventListener("keydown", (event) => {
        if(event.key === "Enter"){
            console.log(searchBox.value);
        }
    });
// Search bar END


// keeping the current page on reload START
window.addEventListener('load', ()=>{
    const savedPage = localStorage.getItem('pageToShow') || 'homePageNotLogined';
    replaceDivs(savedPage);
});
// keeping the current page on reload END


//Pages traversal (DOM manipulation) START
function replaceDivs(pageToShow){
    const pages = ["loginPage","signUpPage","homePageNotLogined"]
    for(const page of pages){
    document.getElementById(page).style.display = "none";
    }
    
    document.getElementById(pageToShow).style.display = "block";
    localStorage.setItem('pageToShow', pageToShow);
}

window.replaceDivs = replaceDivs;

//Pages traversal (DOM manipulation) END