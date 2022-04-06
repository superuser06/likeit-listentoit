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
    this.mood = artistData.strMood ? artistData.strMood.toLowerCase() : 'weird';
    this.origin = artistData.strCountry;
    this.thumb = artistData.strArtistThumb;
    this.wideThumb = artistData.strArtistWideThumb;
    this.similarityIndex = similarityIndex;
    this.lastFmUrl = lastFmUrl;
    this.id = this.name.split(' ').join('-').toLowerCase();
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
    for (let i = 0; i < 6; i++) {
      var artist = this.similar[i];
      // creating element
      var capsuleCardEl = document.createElement("div");
      capsuleCardEl.className = "cell auto";
      capsuleCardEl.innerHTML = (
        `
        <div class="card">
          <!-- insert the band name -->
          <div class="card-header">
            <h4>${artist.name}</h4>
          </div>
          <!-- insert the band image -->
          <div class="band-image">
            <img src="${artist.thumb}" alt="" />
          </div>
          <!-- insert the band info -->
          <div class="card-section">
            ${Math.round(artist.similarityIndex * 100)}% similar to ${this.name}. ${artist.genre} band from ${artist.origin}. They play a ${artist.style} sound with a ${artist.mood} mood.
          </div>
          <div class="buttons">
            <!-- play button -->
            <button type="button">
              <a href="${artist.lastFmUrl}" target="_blank">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-play-circle" viewBox="0 0 16 16">
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                  <path d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445z"/>
                </svg>
              </a>
            </button>
            <!-- explore button -->
            <button type="button" onclick="searchArtist('${artist.name}', true, true)">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-node-plus" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M11 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM6.025 7.5a5 5 0 1 1 0 1H4A1.5 1.5 0 0 1 2.5 10h-1A1.5 1.5 0 0 1 0 8.5v-1A1.5 1.5 0 0 1 1.5 6h1A1.5 1.5 0 0 1 4 7.5h2.025zM11 5a.5.5 0 0 1 .5.5v2h2a.5.5 0 0 1 0 1h-2v2a.5.5 0 0 1-1 0v-2h-2a.5.5 0 0 1 0-1h2v-2A.5.5 0 0 1 11 5zM1.5 7a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1z"/>
              </svg>
            </button>
          </div>
        </div>
        `
      );
      matchesEl.appendChild(capsuleCardEl);
    }
  }
}

async function searchArtist(artistStr, explode=true, storeArtist=false) {
  try {
    // cleaning up string
    var urlArtistStr = encodeURIComponent(artistStr.trim().toLowerCase());
    // creating the url of the apis to get the artist data
    var apiAudioDb = (
      `https://www.theaudiodb.com/api/v1/json/2/search.php`
      + `?s=${urlArtistStr}`
    );
    var apiLastFm = (
      `https://ws.audioscrobbler.com/2.0/`
      + `?method=artist.getsimilar`
      + `&artist=${urlArtistStr}`
      + `&api_key=53346310a0cd2a63988f37c9d6e8a02e`
      + `&limit=15`
      + `&format=json`
    );
    // making API calls
    const [audioDbResponse, lastFmResponse] = await Promise.all([
      fetch(apiAudioDb),
      fetch(apiLastFm)
    ]);
    if (!(audioDbResponse.ok && lastFmResponse.ok)) {
      console.log(`audioDbResponse.status: ${audioDbResponse.status} and lastFmResponse.status ${lastFmResponse.status}`);
    }
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
  catch {
    console.log("went into catch on searchArtist.");
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
  // debugger;
  if ((artistsPile === "[]" || artistsPile)) {
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