// start search on load
window.onload = (e) => {
    startSearch();
}
	
let displayTerm = "";

// define startSearch
function startSearch(){

    let url = "https://www.cheapshark.com/api/1.0/deals?storeID=1";

    // see what the URL looks like
    console.log(url);
    
    // Request data!
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
    let bigString = "<p><i>Here are " + results.length + " results</i></p>";
    
    // loop through the array of results
    for (let result of results)
    {
        // get the URL to the steam page

        // Build a <div> to hold each result
        let line = `<div class='result'>`;
        line += `<img src='${result.thumb}' title='${result.title}'/>`;
        line += `<span><p>${result.title} is on sale for ${result.salePrice}</p></span>`
        line += `</div>`;

        bigString += line;
    }

    // all done building the HTML - show it to the user!
    document.querySelector("#content").innerHTML = bigString;
}

function dataError(e){
    console.log("An error occurred!");
}