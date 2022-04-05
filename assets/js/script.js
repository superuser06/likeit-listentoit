// LAST FM INFO
// Application name	UofT bootcamp project
// API key	53346310a0cd2a63988f37c9d6e8a02e
// Shared secret	768cc7db0209fa3814852919df6a8f63
// Registered to	luizmedina87
let slideIndex = 0;
const imageURL=[
  "./assets/images/image-1.jpg",
  "./assets/images/image-2.jpg",
  "./assets/images/image-3.jpg",
  "./assets/images/image-4.jpg",
  "./assets/images/image-5.jpg",
  "./assets/images/image-6.jpg"
]
showSlides();

function showSlides() {
  let slides = document.querySelector(".splash-container");
  
    slides.style.display = "none";  
    slides.style.backgroundImage = "url(" + imageURL[slideIndex] + ")";
    //console.log(slides[i]);
  
  slideIndex++;
  if (slideIndex > imageURL.length-1) {slideIndex = 0}    
  
  slides.style.display = "block";  
  setTimeout(showSlides, 5000); 
}

class Artist {
  constructor(artistData, similarArtists=null, similarityIndex=null, lastFmUrl="") {
    this.name = artistData.strArtist;
    this.genre = artistData.strGenre;
    this.style = artistData.strStyle;
    this.mood = artistData.strMood;
    this.origin = artistData.strCountry;
    this.thumb = artistData.strArtistThumb;
    this.wideThumb = artistData.strArtistWideThumb;
    this.similarityIndex = similarityIndex;
    this.lastFmUrl = lastFmUrl;
    if (similarArtists) {
      this.similar = similarArtists;
      console.log(artistData);
      console.log(similarArtists);
    }
  }
  createHtmlElements() {
    var matchesEl = document.getElementById("matches");
    // deleting existing cards, if any
    matchesEl.innerHTML = "";
    // creating a card for each artist
    for (let i = 0; i < this.similar.length; i++) {
      var artist = this.similar[i];
      // creating element
      var cardNameEl = document.createElement("p");
      cardNameEl.textContent = artist.name;
      var similarityEl = document.createElement("p");
      similarityEl.textContent = artist.similarityIndex;
      var cardDivEl= document.createElement("div");
      cardDivEl.setAttribute("id", `${artist.name}-div`);
      cardDivEl.appendChild(cardNameEl);
      cardDivEl.appendChild(similarityEl);
      var capsuleCardEl = document.createElement("a");
      capsuleCardEl.setAttribute("href", `${artist.lastFmUrl}`);
      capsuleCardEl.setAttribute("target", "_blank");
      capsuleCardEl.appendChild(cardDivEl);
      // appending element
      matchesEl.appendChild(capsuleCardEl);
      // console.log(i);
    }
  }
}

// CREATE TRY CATCH
async function searchArtist(artistStr, explode=true, storeArtist=false) {
  // creating the url of the apis to get the artist data
  var apiAudioDb = (
    `https://www.theaudiodb.com/api/v1/json/2/search.php`
    + `?s=${artistStr}`
  );
  // https://ws.audioscrobbler.com/2.0/?method=artist.getsimilar&artist=travis&api_key=53346310a0cd2a63988f37c9d6e8a02e&limit=6&format=json
  var apiLastFm = (
    `https://ws.audioscrobbler.com/2.0/`
    + `?method=artist.getsimilar`
    + `&artist=${artistStr}`
    + `&api_key=53346310a0cd2a63988f37c9d6e8a02e`
    + `&limit=6`
    + `&format=json`
  );
  // making API calls
  const [audioDbResponse, lastFmResponse] = await Promise.all([
    fetch(apiAudioDb),
    fetch(apiLastFm)
  ]);
  const [audioDbJson, lastFmJson] = await Promise.all([
    audioDbResponse.json(),
    lastFmResponse.json()
  ])
  const [audioDbData, lastFmData] = await Promise.all([
    audioDbJson,
    lastFmJson
  ])
  // using API data to create object
  var similarArtistsData = lastFmData.similarartists.artist;
  // debugger;
  var searchedArtistData = audioDbData.artists[0];
  if (explode) {
    var similarArtistObjs = [...Array(similarArtistsData.length)];
    for (let i = 0; i < similarArtistsData.length; i++) {
      similarArtistObjs[i] = await searchArtist(similarArtistsData[i].name, false);
      similarArtistObjs[i].similarityIndex = similarArtistsData[i].match;
      similarArtistObjs[i].lastFmUrl = similarArtistsData[i].url;
    }
    var searchedArtist = new Artist(searchedArtistData, similarArtistObjs);
    // creating cards
    searchedArtist.createHtmlElements();
    // clearing the form
    document.getElementById(`search-artist`).value = "";
    // saving artist to memory
    if (storeArtist) {
      pushArtist(searchedArtist.name);
    }
    // creating back button
    makeBackBtn();
  }
  else {
    var similarArtist = new Artist(searchedArtistData);
    return similarArtist;
  }
}

function pushArtist(artistName) {
  var artistsPile = localStorage.getItem("artistsPile");
  artistsPile = JSON.parse(artistsPile);
  if (!artistsPile) {
    artistsPile = [artistName];
  }
  else {
    artistsPile.push(artistName);
  }
  localStorage.setItem("artistsPile", JSON.stringify(artistsPile));
}

function popArtist() {
  var artistsPile = localStorage.getItem("artistsPile");
  artistsPile = JSON.parse(artistsPile);
  if (!artistsPile) {
    console.log("no artists to pop");
  }
  else {
    var poppedArtist = artistsPile.pop();
    localStorage.setItem("artistsPile", JSON.stringify(artistsPile));
    return poppedArtist;
  }
}

function readLastArtist() {
  var artistsPile = localStorage.getItem("artistsPile");
  artistsPile = JSON.parse(artistsPile);
  if (!artistsPile) {
    console.log("no artists to find");
  }
  else {
    var poppedArtist = artistsPile.pop();
    return poppedArtist;
  }
}

function makeContinueBtn() {
  var artistsPile = localStorage.getItem("artistsPile");
  artistsPile = JSON.parse(artistsPile);
  if (artistsPile) {
    console.log("here");
    var formHolderEl = document.getElementById("form-holder");
    var pBtnEl = document.createElement("p");
    pBtnEl.innerHTML = `<a href="#" id="continue-btn" class="pure-button pure-button-primary">Continue where you left off</a>`;
    formHolderEl.appendChild(pBtnEl);
    // lets the user continue where he left off
    document.getElementById(`continue-btn`).addEventListener("click", function(event) {
      event.preventDefault();
      searchArtist(readLastArtist());
      // hides button after clicking it
      this.style.display = "none";
    });
  }
}

function makeBackBtn() {
  // checking if there should be a back button
  var artistsPile = localStorage.getItem("artistsPile");
  artistsPile = JSON.parse(artistsPile);
  if (artistsPile.length > 1) {
    // clearing old button
    try {
      console.log("i am trying to create a back button");
      document.getElementById("back-btn").remove();
    }
    catch {
      console.log("no back button to remove");
    }
    // gettng the index of the next to last artist
    var backIndex = artistsPile.length - 2;
    var backArtist = artistsPile[backIndex];
    // creating the button
    var backBtnText = `Back to ${backArtist}`;
    var backBtnEl = document.createElement("p");
    var formHolderEl = document.getElementById("form-holder");
    backBtnEl.innerHTML = `<a href="#" id="back-btn" class="pure-button pure-button-primary">${backBtnText}</a>`;
    formHolderEl.appendChild(backBtnEl);
    // make it clickable
    backBtnEl.addEventListener("click", function() {
      // removes the most recent artist searched
      popArtist();
      // gets the previous one and searches it again
      searchArtist(popArtist(), true, true);
    });
  }
}

// Creates the continue button if there is something saved to local storage
makeContinueBtn();

// lets the user search for a new artist
document.getElementById(`search-btn`).addEventListener("click", function(event) {
  event.preventDefault();
  // clears the search history each time the user inputs a new artist
  localStorage.setItem("artistsPile", "[]");
  // hides continue button if the user didn't click it
  try {
    document.getElementById(`continue-btn`).style.display = "none";
  }
  catch {
    console.log("no continue button");
  }
  // searches the new artist
  var userInput = document.getElementById(`search-artist`).value;
  searchArtist(userInput, true, true);
});