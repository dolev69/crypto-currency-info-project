"use strict";

$(() => {

  let interval; // this variable will hold setInterval and will be used to clearInterval

  const currenciesLink = document.getElementById("currenciesLink");
  const liveReportsLink = document.getElementById("liveReportsLink");
  const aboutLink = document.getElementById("aboutLink");
  const mainContent = document.getElementById("mainContent");

  // displays the currencies when pressing currencies button;
  currenciesLink.addEventListener("click", displayCurrencies);
  
  async function displayCurrencies() {
    clearInterval(interval);
    try {
      const spinner = document.getElementById("spinner"); // loading spinner (modified in css).
      spinner.style.display = "inline-block"; // shows the loading spinner.
      const storedCoinsData = sessionStorage.getItem("coinsData"); // gets the data from session storage.
      let coins;

      if (storedCoinsData) { // if we already have the data then we just print the coins
        coins = JSON.parse(storedCoinsData);
        printCoins(coins);
      }

      else {
        coins = await getJson("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1"); // api call
        printCoins(coins);
        saveToSessionStorage(coins); // saving to session storage - incase of reload window.
      }
    } catch (err) {
      console.log(`Error displaying the currencies: ${err}`);
    } finally {
      spinner.style.display = "none"; // hides the loading spinner when done.
    }}
  
  // diplays the live reports page when clicked
  liveReportsLink.addEventListener("click", displayLiveReports);
  
  async function displayLiveReports() {
    const checkedCoins = JSON.parse(sessionStorage.getItem("checkedCoins")); // all the checked coins
    const coinDataPoints = {};

    if (checkedCoins) {
    // displays 2 buttons and the live report div
    mainContent.innerHTML = `<div id="chartContainer" style="height: 370px; width: 100%; background-color: white;"></div>`;
    async function getHistoricalData(coin) { // just to get some info about the past USD value to make a nice display in the graph instead of single dot of current price.
      
      const today = new Date();
      const toTs = Math.floor(today.getTime() / 1000);
      const endpoint = `https://min-api.cryptocompare.com/data/v2/histoday?fsym=${coin}&tsym=USD&limit=7&toTs=${toTs}&aggregate=1`; // api link

      const response = await fetch(endpoint); // api call to the history data
      const data = await response.json();
      return data.Data.Data;
    }

    function parseHistoricalData(historicalData) { // shows the past usd data in the graph
      return historicalData.map((data) => ({
        x: new Date(data.time * 1000),
        y: data.close,
      }));
    }

      for (const coin of checkedCoins) {
        const historicalData = await getHistoricalData(coin);
        coinDataPoints[coin] = parseHistoricalData(historicalData);
      }

      const datasets = Object.entries(coinDataPoints).map(([coin, dataPoints]) => ({

        type: "spline",
        name: coin,
        showInLegend: true,
        xValueFormatString: "MMM YYYY",
        yValueFormatString: "$#,##0.#",
        dataPoints: dataPoints,

      }));

        // Configure graph options
  const options = {
    exportEnabled: true,
    animationEnabled: true,
    title: {
      text: "CCI - Crypto Currency Info - Historical Data",
    },
    subtitles: [
      {
        text: "MADE BY DOLEVM",
      },
    ],
    axisX: {
      title: "Date",
      type: "dateTime", // Set the x-axis type to dateTime
    },
    axisY: {
      title: "COIN USD VALUE",
      titleFontColor: "red",
      lineColor: "red",
      labelFontColor: "red",
      tickColor: "red",
      minimum: 0,
      maximum: 50000,
    },
    axisY2: {
      title: "COIN USD VALUE",
      titleFontColor: "#C0504E",
      lineColor: "#C0504E",
      labelFontColor: "#C0504E",
      tickColor: "#C0504E",
    },
    toolTip: {
      shared: true,
    },
    legend: {
      cursor: "pointer",
      itemclick: toggleDataSeries,
    },
    data: datasets,
  };

  $("#chartContainer").CanvasJSChart(options);

function toggleDataSeries(e) {
  if (typeof e.dataSeries.visible === "undefined" || e.dataSeries.visible) {
    e.dataSeries.visible = false;
  } else {
    e.dataSeries.visible = true;
  }
  e.chart.render();
}

      interval = setInterval(async function () {

        for (const coin of checkedCoins) {

          const liveCoins = await getJson(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${coin}&tsyms=USD`); // api call to the checked coin USD value
          const usdValue = liveCoins[coin].USD; // USD value of every coin

          if (!coinDataPoints[coin]) {
            coinDataPoints[coin] = [];
          }
          
          // Add the data point for the current coin to the array
          coinDataPoints[coin].push({ x: Date.now(), y: usdValue });
          if (coinDataPoints[coin].length > 10) {
            coinDataPoints[coin].shift(); // Remove the first data point (oldest data point) from the array.
          }
        }
          
      }, 4000);
    } else {
      mainContent.innerHTML = `<h2>SELECT 1-5 COINS TO ACTIVATE LIVE REPORT`
    }
  }
  
  // display the about me page when clicked
  aboutLink.addEventListener("click", displayAbout);

  function displayAbout() {

    clearInterval(interval);
    mainContent.innerHTML =
      `<div class="about">
          <h1>About me</h1>
          <img src="assets/profilePic.png" width="200">
          <p>
            Dolev Mizrachi<br><br>
            dolevmizrachii@gmail.com<br><br>
            <div class="social-media">
              <a href="https://github.com/zdolevm" target="_blank"><i class='bx bxl-github' ></i></a>
            </div>
            MADE BY DOLEVM
          </p>
        </div>`
  }

  // saving to session storage to prevent spamming the api
  function saveToSessionStorage(coins) {
    sessionStorage.setItem("coinsData" , JSON.stringify(coins)); // stores the coins data in session storage
  }

  function saveToSessionStorageCheckedCoins(checkedCoins) {
    sessionStorage.setItem("checkedCoins" , JSON.stringify(checkedCoins)); // stores the checked coins in the session storage
    }

  function getFromSessionStorageCheckedCoins() { // getting the stored data of checked coins
    const getItem = sessionStorage.getItem("checkedCoins");

    if (getItem) {
      const checkedC = JSON.parse(getItem);
      return checkedC;
    }
  }

  // gets the data from the api and returns json of the data
  async function getJson(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("response is not okay"); // throws error when response is not okay.
      }

      const json = await response.json();
      return json; // returns the data from the api.

    } catch (error) { // catches the thrown ERROR and handles with it.
      console.error("Error fetching JSON:", error);
      throw error;
    }
  }

  // prints the coins in cards (card container from bootstrap)
  function printCoins(coins) {
    const mainContent = document.getElementById("mainContent"); // main content div.
    let html = "";

    for (const coin of coins) { // looping through every coin from the api.
      html +=
        `<div class="cards-container">
          <div class="card">
            <img class="card-img-top" src="${coin.image}">
              <div class="card-body">
                <h5 class="card-title">${coin.symbol.toUpperCase()}</h5>   
                  <p class="card-text">${coin.name}</p>
                    <div class="form-check form-switch">
                      <input class="form-check-input" type="checkbox" role="switch" id="${coin.market_cap_rank}" switch="${coin.symbol.toUpperCase()}">
                      <label class="form-check-label" for="flexSwitchCheckDefault"></label>
                    </div>
                    <br>
                    <a class="btn btn-success" data-toggle="collapse" data-coin-name="${coin.id}" id="collapseBtn${coin.market_cap_rank}" role="button" aria-expanded="false" aria-controls="collapseExample">More Info</a><div class="spinner" id="spinnerId${coin.market_cap_rank}"></div>
                    <div class="collapse" id="collapseId${coin.market_cap_rank}"></div>
                    <div class="moreInfo" id="moreInfoContent-${coin.market_cap_rank}"></div>
                </div>
              </div>
            </div>`
    }
    mainContent.innerHTML = html;
    
    for (const coin of coins) {
      const collapseBtn = document.getElementById(`collapseBtn${coin.market_cap_rank}`);
      collapseBtn.addEventListener("click", async function() {

        const button = this;
        const coinName = button.getAttribute("data-coin-name");
        const collapseContent = $(`#collapseId${coin.market_cap_rank}`);

        const spinner = document.getElementById(`spinnerId${coin.market_cap_rank}`); // loading spinner
        spinner.style.display = "inline-block"; // shows the loading spinner

        const isHidden = !collapseContent.hasClass("show");
        collapseContent.collapse("toggle");

        const savedSessionStorageMoreInfo = sessionStorage.getItem(coinName);
        let moreInfoCoinData;

        if (isHidden) {
          if (savedSessionStorageMoreInfo) {
            moreInfoCoinData = JSON.parse(savedSessionStorageMoreInfo);
            const currentTime = new Date().getTime();
            
            if (currentTime > moreInfoCoinData.expDate) { // if the saved data is older than 2 minutes
              moreInfoCoinData = await getJson(`https://api.coingecko.com/api/v3/coins/${coinName}`); // new api call
              moreInfoCoinData.expDate = new Date().setMinutes(new Date().getMinutes() + 2); // adding expDate
              sessionStorage.setItem(coinName, JSON.stringify(moreInfoCoinData)); // updating session storage
            }
          
            if (moreInfoCoinData) {
            $(`#collapseId${coin.market_cap_rank}`).html(`
                  ILS = ₪${moreInfoCoinData.market_data.current_price.ils}
                    <br>
                  USD = $${moreInfoCoinData.market_data.current_price.usd}
                    <br>
                  EUR = €${moreInfoCoinData.market_data.current_price.eur}
                `);
            }
          }

          else {
            moreInfoCoinData = await getJson(`https://api.coingecko.com/api/v3/coins/${coinName}`);
            moreInfoCoinData.expDate = new Date().setMinutes(new Date().getMinutes() + 2);

            $(`#collapseId${moreInfoCoinData.market_cap_rank}`).html(
                `
                  ILS = ₪${moreInfoCoinData.market_data.current_price.ils}
                    <br>
                  USD = $${moreInfoCoinData.market_data.current_price.usd}
                    <br>
                  EUR = €${moreInfoCoinData.market_data.current_price.eur}
                `
            )
            sessionStorage.setItem(coinName, JSON.stringify(moreInfoCoinData));
         }
        }

        spinner.style.display = "none"; // hides the loading spinner when done.
      });
      
    }
    let checkedCoins = getFromSessionStorageCheckedCoins() || []; // array of all the checked coins (default to an empty array if not found)
    let coinsList = $("#coinsList"); // div where all the checked coins will be displayed
  
    for (const coin of coins) {
      const switchButton = document.getElementById(coin.market_cap_rank);
      switchButton.addEventListener("change", function () {
        const switchValue = this.getAttribute("switch");
  
        if (this.checked) {
          if (checkedCoins.length >= 5) {
            showLimitReachedModal(checkedCoins, coins); // Show the modal with the selected coins
            this.checked = false; // Uncheck the switch button if the limit is reached
          }
          checkedCoins.push(switchValue); // pushing the checked coin to the checkedCoins array
        } else {
          const index = checkedCoins.indexOf(switchValue); // getting the index of the unchecked coin;
  
          if (index !== -1) {
            checkedCoins.splice(index, 1); // removing the unchecked coin from the aray
          }
        }
  
        saveToSessionStorageCheckedCoins(checkedCoins); // saving to checked coins session storage
        coinsList.html("<span>Coins Selected:</span> " + checkedCoins.join(" / ")); // displaying the selected coins
      });
  
      if (checkedCoins.includes(coin.symbol.toUpperCase())) { // if there's already checked coins in session storage so it keeps them checked and displays
        switchButton.checked = true;
        coinsList.html("<span>Coins Selected:</span> " + checkedCoins.join(" / ")); 
      }
    }
  }

  // modal popping up after 5 checked coins
  const limitReachedModal = document.getElementById("limitReachedModal");
  function showLimitReachedModal(checkedCoins, coins) {
    let html = "";
    for (const coin of checkedCoins) {
      html += 
        `<div><h5 class="card-title">${coin.toUpperCase()}</h5>
        
        <div class="form-check form-switch">

          <input class="form-check-input" type="checkbox" role="switch" id="${coin}" checked>

          <label class="form-check-label" for="flexSwitchCheckDefault"></label>

        </div></div>`
    }

    $(".modal-body").html(html);
    $(limitReachedModal).modal("show");

    const limitReachedModalCloseBtn = limitReachedModal.querySelector(".btn-secondary");
    limitReachedModalCloseBtn.addEventListener("click", function () {
      
    if (checkedCoins.length > 5) {
      checkedCoins.pop();
    }
    saveToSessionStorageCheckedCoins(checkedCoins);
    $(limitReachedModal).modal("hide");
    printCoins(coins);
    }); 

    $(limitReachedModal).on("hidden.bs.modal", function () {

    if (checkedCoins.length > 5) {
      checkedCoins.pop();
      saveToSessionStorageCheckedCoins(checkedCoins);
      printCoins(coins);
    }
    });

    for (const coin of checkedCoins) {
      const switchButton = document.getElementById(coin);
      switchButton.addEventListener("change", function () {
        const switchValue = this.getAttribute("id"); // Use "id" instead of "switch"
        
        if (!this.checked) {
          // Unchecking the coin
          const index = checkedCoins.indexOf(switchValue);
          if (index !== -1) {
            checkedCoins.splice(index, 1); // Remove the unchecked coin from the array
          }
        }
        
        saveToSessionStorageCheckedCoins(checkedCoins);
        $(limitReachedModal).modal("hide");
        printCoins(coins);
      });
    }
      
  }

  // search input top right - searching by coin name or coin symbol
  const searchForm = document.getElementById("searchForm");
  searchForm.addEventListener("input", search); // event listner to the search input

  function search() {
    const searchInput = document.getElementById("searchInput");
    const userSearch = searchInput.value; // what the user types for search

    searchCoins(userSearch); // searching what the user types
  }

  async function searchCoins(userSearch) {
    const storedCoinsData = sessionStorage.getItem("coinsData"); // gets the data from session storage.
    let coins;

    if (storedCoinsData) { // if we already have the data then we just print the coins
      coins = JSON.parse(storedCoinsData);
      printCoins(coins);
    } else {
      coins = await getJson("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1"); // api call
    }

    const filteredCoins = coins.filter((coin) => {
      return coin.name.toLowerCase().includes(userSearch.toLowerCase()) || coin.symbol.toLowerCase().includes(userSearch.toLowerCase()); // looking for coin name or symbol (lowercase/uppercase does not matter)
    });

    if (filteredCoins.length === 0) {
      mainContent.innerHTML = `<h2>No matching coins</h2>` // if search does not show any coins.
    } else {
      printCoins(filteredCoins); // prints the coins of what user searched.
    }
  }    
})