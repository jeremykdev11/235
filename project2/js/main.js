// start search on load
const defaultURL = "https://www.cheapshark.com/api/1.0/deals?storeID=1";

let searchInput, searchSort, searchRating;
let prefix, inputKey, sortKey, ratingKey;
let storedInput, storedSort, storedRating;

window.onload = (e) => {

    // update fields on load
    searchInput = document.getElementById("searchInput");
    searchSort = document.querySelector("#searchSelectSort");
    searchRating = document.querySelector("#searchSelectRating");
    
    prefix = "jck7676-";
    inputKey = prefix + "input";
    sortKey = prefix + "sort";
    ratingKey = prefix + "rating";

    storedInput = localStorage.getItem(inputKey);
    storedSort = localStorage.getItem(sortKey);
    storedRating = localStorage.getItem(ratingKey);

    // If we find a previously set name value, display it
    if (storedInput) searchInput.value = storedInput;
    if (storedSort) searchSort.value = storedSort;
    if (storedRating) searchRating.value = storedRating;

    // Get default data
    let url = defaultURL;
    if (storedInput) url += "&title=" + encodeURIComponent(storedInput.trim());
    if (storedSort) url += "&sortBy=" + storedSort;
    if (storedRating) url += "&metacritic=" + storedRating;
    url += "&onSale=1";

    getData(url);

    document.querySelector("#searchButton").onclick = startSearch;
}
	
let displayTerm = "";

// define startSearch
function startSearch(){
    document.querySelector("#results").innerHTML = '<caption id="infoText">Searching...</caption>';

    // Update localStorage when search started
    localStorage.setItem(inputKey, searchInput.value);
    localStorage.setItem(sortKey, searchSort.value);
    localStorage.setItem(ratingKey, searchRating.value);

    // Set up search link
    let url = defaultURL;

    // Add title to url
    let title = document.querySelector("#searchInput").value;
    title = title.trim();
    title = encodeURIComponent(title);
    if (title) url += "&title=" + title;

    // Add sort parameters to url
    let sort = document.querySelector("#searchSelectSort").value;
    if (sort) url += "&sortBy=" + sort;

    // Add minimum rating to url
    let rating = document.querySelector("#searchSelectRating").value;
    if (rating) url += "&metacritic=" + rating;

    // Ensure game is on sale
    url += "&onSale=1";

    getData(url);
}

function getData(url){
    // create a new XHR object
    let xhr = new XMLHttpRequest();

    // set the onload handler
    xhr.onload = dataLoaded;

    // set the onerror handler
    xhr.onerror = dataError;

    // open connection and send the request
    xhr.open("GET", url);
    xhr.send();
}

function unixToDate(value) {
    let date = new Date(value * 1000);

    return date.toLocaleString("en-GB", {
        month: "short",
        year: "numeric",
      });
}

// Callback Functions

function dataLoaded(e){
    // event.target is the xhr object
    let xhr = e.target;

    // xhr.responseText is the JSON file we just downloaded
    // turn the text into a parsable JavaScript object
    let results = JSON.parse(xhr.responseText);

    let displayResults = "";

    // make sure there are results
    if (!results || results.length == 0) {
        displayResults = '<caption id="infoText">No results found.</caption>';
    }
    else {
        // Start building an HTML string we will display to the user
        let bigString =
        `<tr>
        <th></th>
        <th data-cell="title" id="fill"><p>Title</p></th>
        <th data-cell="% off"><p>% Off</p></th>
        <th data-cell="price"><p>Price</p></th>
        <th data-cell="metacritic"><p>Metacritic</p></th>
        <th data-cell="user rating"><p>User Rating</p></th>
        <th data-cell="release date"><p>Release Date</p></th>
        </tr>`;
    
        // loop through the array of results
        for (let result of results)
        {       
            // Build url to steam page and thumbnail
            let steam = `http://store.steampowered.com/app/${result.steamAppID}`;
            let thumbnail = `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${result.steamAppID}/header.jpg`

            // Build a table element to hold each result
            let line = `<tr>`;
            line += `<td data-cell="thumbnail" class="thumbnail"><a href='${steam}'><img class="img" src='${thumbnail}' title='${result.title}'/></a></td>`;
            line += `<td data-cell="title"><a href='${steam}' title='${result.title}'><p>${result.title}</p></a></td>`;
            line += `<td data-cell="% off"><p>${Math.round(result.savings)}%</p></td>`;
            line += `<td data-cell="price"><p>$${result.salePrice}</td>`;
            line += `<td data-cell="metacritic"><p>${result.metacriticScore}%</p></td>`;
            line += `<td data-cell="user rating"><p>${result.steamRatingPercent}%</p></td>`;
            line += `<td data-cell="release date"><p>${unixToDate(result.releaseDate)}</p></td>`;
            line += `</tr>`;
    
            bigString += line;
        }
        
        displayResults = `<caption id="infoText">Here are ${results.length} results.</caption>` + bigString;
    }

    // all done building the HTML - show it to the user!
    document.querySelector("#results").innerHTML = displayResults;
}

function dataError(e){
    console.log("An error occurred!");
}