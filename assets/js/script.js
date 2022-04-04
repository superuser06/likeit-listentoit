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
    for (let i = 0; i < this.similar.length; i++) {
      // debugger;
      var artist = this.similar[i];
      // creating element
      var cardNameEl = document.createElement("p");
      cardNameEl.textContent = artist.name;
      var similarityEl = document.createElement("p");
      similarityEl.textContent = artist.similarityIndex;
      var cardDivEl= document.createElement("div");
      cardDivEl
        .setAttribute("id", `${artist.name}-div`)
        .appendChild(cardNameEl)
        .appendChild(similarityEl);
      var capsuleCardEl = document.createElement("a");
      capsuleCardEl
        .setAttribute("href", `${artist.lastFmUrl}`)
        .setAttribute("target", "_blank")
        .appendChild(cardDivEl);
      // appending element
      var matchesEl = document.getElementById("matches");
      matchesEl.appendChild(capsuleCardEl);
      console.log(i);
    }
  }
}

async function searchArtist(artistStr, explode=true) {
  // creating the url of the apis to get the artist data
  var apiAudioDb = (
    `https://www.theaudiodb.com/api/v1/json/2/search.php`
    + `?s=${artistStr}`
  );
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
  var searchedArtistData = audioDbData.artists[0];
  if (explode) {
    var similarArtistObjs = [...Array(similarArtistsData.length)];
    for (let i = 0; i < similarArtistsData.length; i++) {
      similarArtistObjs[i] = await searchArtist(similarArtistsData[i].name, false);
      similarArtistObjs[i].similarityIndex = similarArtistsData[i].match;
      similarArtistObjs[i].lastFmUrl = similarArtistsData[i].url;
    }
    // console.log(similarArtistObjs);
    var searchedArtist = new Artist(searchedArtistData, similarArtistObjs);
    // searchedArtist.createHtmlElements(); // FIX HERE
    pushArtist(searchedArtist.name);
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
  console.log("here");
  if (!artistsPile) {
    console.log("no artists to pop")
  }
  else {
    var poppedArtist = artistsPile.pop();
    localStorage.setItem("artistsPile", JSON.stringify(artistsPile));
    return poppedArtist;
  }
}

document.getElementById(`search-btn`).addEventListener("click", function(event) {
  event.preventDefault();
  var userInput = document.getElementById(`search-artist`).value;
  searchArtist(userInput);
});

// BTN SHOULD ONLY SHOW IF LOCAL STORAGE EXISTS
document.getElementById(`continue-btn`).addEventListener("click", function(event) {
  event.preventDefault();
  console.log(popArtist());
})
