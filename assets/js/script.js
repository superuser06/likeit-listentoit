// LAST FM INFO
// Application name	UofT bootcamp project
// API key	53346310a0cd2a63988f37c9d6e8a02e
// Shared secret	768cc7db0209fa3814852919df6a8f63
// Registered to	luizmedina87

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
    searchedArtist = new Artist(searchedArtistData, similarArtistObjs);
    // ELEMENT CREATION SHOULD GO HERE
  }
  else {
    var similarArtist = new Artist(searchedArtistData);
    return similarArtist;
  }
}

// example search
var userInput = `coldplay`; // CHANGE HERE TO LINK WITH HTML INPUT
searchArtist(userInput);

// teste(userInput);
// function teste(x) {
//   // var getTasteUrl = `http://api.deezer.com/playlist/580739065?output=jsonp`;
//   var getTasteUrl = `https://api.deezer.com/search?q=eminem?output=jsonp`;
//   // var getTasteUrl = `https://api.deezer.com/oembed?url=https://www.deezer.com/album/302127&maxwidth=700&maxheight=300&tracklist=true&format=json&output=json`
//   $.ajax({
// 		url: getTasteUrl,
// 		type: 'GET', 
// 		// data: {
// 		// 	q: x,
//     //   output: jsonp
// 		// },
// 		dataType: "jsonp"
// 	}).then(resp=>console.log(resp));
// }