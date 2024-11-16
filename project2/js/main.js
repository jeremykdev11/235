// start search on load
window.onload = (e) => {
    startSearch();
}
	
let displayTerm = "";

// define startSearch
function startSearch(){
    let url = "https://www.cheapshark.com/api/1.0/deals?storeID=1";
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
    console.log(xhr.responseText);

    // turn the text into a parsable JavaScript object
    let results = JSON.parse(xhr.responseText);

    // if there are no results, print a message and return
    if (!results || results.length == 0) {
        return; // Bail out
    }

    // Start building an HTML string we will display to the user
    let bigString = "";
    
    // loop through the array of results
    for (let result of results)
    {
        // Build a table element to hold each result
        let line = `<tr>`;
        line += `<td><img src='${result.thumb}' title='${result.title}'/></td>`;
        line += `<td>${result.title}</td>`
        line += `<td>${Math.round(result.savings)}%</td>`
        line += `<td>$${result.salePrice}</td>`
        line += `<td>${result.steamRatingPercent}%</td>`
        line += `<td>${unixToDate(result.releaseDate)}</td>`
        line += `</tr>`;

        bigString += line;
    }

    // all done building the HTML - show it to the user!
    document.querySelector("#results").innerHTML += bigString;
}

function dataError(e){
    console.log("An error occurred!");
}