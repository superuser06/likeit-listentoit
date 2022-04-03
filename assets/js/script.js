// LAST FM INFO
// Application name	UofT bootcamp project
// API key	53346310a0cd2a63988f37c9d6e8a02e
// Shared secret	768cc7db0209fa3814852919df6a8f63
// Registered to	luizmedina87

class Artist {
  constructor(artistData, similarArtists=null) {
    this.name = artistData.strArtist;
    this.genre = artistData.strGenre;
    this.style = artistData.strStyle;
    this.mood = artistData.strMood;
    this.thumb = artistData.strArtistThumb;
    this.wideThumb = artistData.strArtistWideThumb;
    if (similarArtists) {
      this.similar = similarArtists;
      console.log(similarArtists);
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
  // if it is the main artist, you want to find similars, so run both
  if (explode) {
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
    for (let i = 0; i < similarArtistsData.length; i++) {
      similarArtistsData[i] = await searchArtist(similarArtistsData[i].name, false);
    }
    var searchedArtistData = audioDbData.artists[0];
    searchedArtist = new Artist(searchedArtistData, similarArtistsData);
  }
  // if it is a similar artist, just find its data, so run audioDb's api
  else {
    const audioDbResponse = await fetch(apiAudioDb);
    const audioDbJson = await audioDbResponse.json();
    const audioDbData = await audioDbJson;
    var searchedArtistData = audioDbData.artists[0];
    var similarArtist = new Artist(searchedArtistData);
    return similarArtist;
  }
}

// example search
var userInput = `coldplay`; // CHANGE HERE TO LINK WITH HTML INPUT
searchArtist(userInput);