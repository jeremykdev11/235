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
    
    prefix = "jck7676-"
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
    url += "&onSale=1"

    console.log(url);

    getData(url);

    document.querySelector("#searchButton").onclick = startSearch;
}
	
let displayTerm = "";

// define startSearch
function startSearch(){

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
    url += "&onSale=1"

    console.log(url);

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
    var date = new Date(value * 1000);

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
    //console.log(xhr.responseText);

    // turn the text into a parsable JavaScript object
    let results = JSON.parse(xhr.responseText);

    // if there are no results, print a message and return
    if (!results || results.length == 0) {
        return; // Bail out
    }

    // Start building an HTML string we will display to the user
    let bigString =
    `<tr>
    <th></th>
    <th id="fill">Title</th>
    <th>% Off</th>
    <th>Price</th>
    <th>Metacritic</th>
    <th>User Rating</th>
    <th>Release Date</th>
    </tr>`;
    
    // loop through the array of results
    for (let result of results)
    {
        // Build url to steam page
        let steam = `http://store.steampowered.com/app/${result.steamAppID}`;

        // Build a table element to hold each result
        let line = `<tr>`;
        line += `<td><a href='${steam}'><img src='${result.thumb}' title='${result.title}'/></a></td>`;
        line += `<td><a href='${steam}' title='${result.title}'>${result.title}</a></td>`
        line += `<td>${Math.round(result.savings)}%</td>`
        line += `<td>$${result.salePrice}</td>`
        line += `<td>${result.metacriticScore}%</td>`
        line += `<td>${result.steamRatingPercent}%</td>`
        line += `<td>${unixToDate(result.releaseDate)}</td>`
        line += `</tr>`;

        bigString += line;
    }

    // all done building the HTML - show it to the user!
    document.querySelector("#results").innerHTML = bigString;
}

function dataError(e){
    console.log("An error occurred!");
}