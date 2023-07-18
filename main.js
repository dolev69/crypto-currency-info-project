"use strict";

$(() => {

  const currenciesLink = document.getElementById("currenciesLink");
  const liveReportsLink = document.getElementById("liveReportsLink");
  const aboutLink = document.getElementById("aboutLink");
  const mainContent = document.getElementById("mainContent");

  // displays the currencies when pressing currencies button;
  currenciesLink.addEventListener("click", displayCurrencies);
  
  async function displayCurrencies() {

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

    spinner.style.display = "none"; // hides the loading spinner when done.
  
  }
  
  // diplays the live reports page when clicked
  liveReportsLink.addEventListener("click", displayLiveReports);
  
  function displayLiveReports() {

    let interval; // this variable will hold setInterval and will be used to clearInterval

    // displays 2 buttons and the live report div
    mainContent.innerHTML = `
      <div style="text-align: center">

        <h2>Press "START" and press <span style="color: red;">"STOP"</span> TO CHECK PRICES</h2>(updates prices every 5 seconds)

        <br><br>

          <button id="startLiveReport" class="btn btn-success">START</button><div class="spinner" id="liveReportSpinner" style="margin-top: 10px; height: 20px; width: 20px;"></div>

          <button id="stopLiveReport" class="btn btn-danger">STOP</button>

      </div>

      <div id="chartContainer" style="height: 370px; width: 100%; background-color: white;"></div>`;


    const startLiveReport = document.getElementById("startLiveReport");
    const stopLiveReport = document.getElementById("stopLiveReport");

    const spinner = document.getElementById("liveReportSpinner"); // loading spinner (modified in css).

    startLiveReport.addEventListener("click", () => { // Live Report Button starts the live report.

      spinner.style.display = "inline-block"; // shows the loading spinner.

      interval = setInterval(async function () {
        const checkedCoins = JSON.parse(sessionStorage.getItem("checkedCoins")); // all the checked coins
        const datasets = []; // Array to hold datasets for all coins

        for (const coin of checkedCoins) {

          const liveCoins = await getJson(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${coin}&tsyms=USD`); // api call to the checked coin USD value
    
          const usdValue = liveCoins[coin].USD; // USD value of every coin
          
          // Add the data point for the current coin to the array
          const dataPointsArray = [
            { x: new Date(2023, 6, 1), y: (usdValue - 1) },
            { x: new Date(2023, 6, 2), y: (usdValue - 1) },
            { x: new Date(), y: usdValue }];
          
          const dataset = {
            type: "spline",
            name: coin,
            showInLegend: true,
            xValueFormatString: "MMM YYYY",
            yValueFormatString: "$#,##0.#",
            dataPoints: dataPointsArray
          };

          datasets.push(dataset); // the dataset for the graph display

        }
          
        var options = { // graph
          exportEnabled: true,
          animationEnabled: true,
          title:{
          text: "CCI - Crypto Currency Info - Live Reports"
          },
          subtitles: [{
            text: "MADE BY DOLEVM"
          }],
          axisX: {
            title: "Coins:"
          },
          axisY: {
            title: "COIN USD VALUE",
            titleFontColor: "red",
            lineColor: "red",
            labelFontColor: "red",
            tickColor: "red"
          },
          axisY2: {
            title: "COIN USD VALUE",
            titleFontColor: "#C0504E",
            lineColor: "#C0504E",
            labelFontColor: "#C0504E",
            tickColor: "#C0504E"
          },
          toolTip: {
            shared: true
          },
          legend: {
            cursor: "pointer",
            itemclick: toggleDataSeries
          },
          data: datasets
        }; // end of graph
  
        $("#chartContainer").CanvasJSChart(options);
          
        function toggleDataSeries(e) {
          if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
            e.dataSeries.visible = false;
          } else {
            e.dataSeries.visible = true;
          }
          e.chart.render();
        }
      }, 5000);

      setTimeout(() => {
        spinner.style.display = "none"; // hides the loading spinner when done.
      }, 5000);
      
    });

    stopLiveReport.addEventListener("click", () => {
      clearInterval(interval);
    })
  }
  
  // display the about me page when clicked
  aboutLink.addEventListener("click", displayAbout);

  function displayAbout() {
    mainContent.innerHTML =
      `
        <div class="about">

          <h1>About me</h1>

          <img src="assets/motilugasi69.jpeg" width="200">

          <p>

            Moti Lugasi<br><br>
  
            motilugasy69@gmail.com<br><br>

            <div class="social-media">

              <a href="https://www.tiktok.com/@motilugasi69?lang=en" target="_blank"><i class='bx bxl-tiktok' ></i></a>

              <a href="https://github.com/dolev69" target="_blank"><i class='bx bxl-github' ></i></a>

              <a href="https://www.instagram.com/motilugasi69/" target="_blank"><i class='bx bxl-instagram' ></i></a>

            </div>

            MADE BY DOLEVM

          </p>
        </div>
      `
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
              `
              <div class="cards-container">

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

                          <a href="#" class="btn btn-success more-info-button" data-coin-id="${coin.market_cap_rank}" data-coin-name="${coin.id}">More Info +</a><div class="spinner" id="spinnerId${coin.market_cap_rank}"></div>

                        <div class="moreInfo" id="moreInfoContent-${coin.market_cap_rank}"></div>

                    </div>

                </div>

              </div>

              `
    }

    mainContent.innerHTML = html;

    let checkedCoins = getFromSessionStorageCheckedCoins() || []; // array of all the checked coins (default to an empty array if not found)
    let coinsList = $("#coinsList"); // div where all the checked coins will be displayed
  
    for (const coin of coins) {
      const switchButton = document.getElementById(coin.market_cap_rank);
  
      switchButton.addEventListener("change", function () {
        const switchValue = this.getAttribute("switch");
  
        if (this.checked) {
          if (checkedCoins.length >= 5) {
            this.checked = false; // Uncheck the switch button if the limit is reached
            showLimitReachedModal(checkedCoins.slice(0, 5)); // Show the modal with the selected coins
            return; // Exit the function to prevent further execution
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

    // after being in currencies page you can access the More Info button here
    $(".more-info-button").on("click", displayMoreInfo); // every more info button. when clicked it calls displayMoreInfo

  }

  // modal popping up after 5 checked coins
  const limitReachedModal = document.getElementById("limitReachedModal");
  function showLimitReachedModal(checkedCoins) {

    $(".modal-body").html(("<span>Coins Selected :</span><br>" + checkedCoins.join(" / ")) + "<br>5 / 5 coins were choosen. you can choose only 5 coins!");

    $(limitReachedModal).modal("show");
      
    const limitReachedModalCloseBtn = limitReachedModal.querySelector(".btn-secondary");

    limitReachedModalCloseBtn.addEventListener("click", function () {

    $(limitReachedModal).modal("hide");

    });   
  }
  
  // when pressing the More Info button it adds the data (collapse + -)
  async function displayMoreInfo() {

    event.preventDefault(); // prevents scrolling up after button click.

    const button = this;
    const coinId = button.getAttribute("data-coin-id");
    const coinName = button.getAttribute("data-coin-name");
            

    const spinner = document.getElementById(`spinnerId${coinId}`); // loading spinner
    spinner.style.display = "inline-block"; // shows the loading spinner

    // coin takes the specific coin that the user pressed more info on
    const coin = await getJson(`https://api.coingecko.com/api/v3/coins/${coinName}`);

    const moreInfoContent = document.getElementById(`moreInfoContent-${coinId}`);
    moreInfoContent.classList.toggle("show");
            
    if (moreInfoContent.classList.contains("show")) { // shows the info in ILS / USD / EUR
      moreInfoContent.innerHTML =
        `
        ILS = ₪${coin.market_data.current_price.ils}
          <br>
        USD = $${coin.market_data.current_price.usd}
          <br>
        EUR = €${coin.market_data.current_price.usd}
        `;
        
        button.textContent = "More Info -";
    }

    else {

      moreInfoContent.innerHTML = "";
      button.textContent = "More Info +";

    }

    spinner.style.display = "none"; // hides the loading spinner when done.

  };

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

    }

    else {

      coins = await getJson("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1"); // api call
    }

    const filteredCoins = coins.filter((coin) => {
      return coin.name.toLowerCase().includes(userSearch.toLowerCase()) || coin.symbol.toLowerCase().includes(userSearch.toLowerCase()); // looking for coin name or symbol (lowercase/uppercase does not matter)
    });

    printCoins(filteredCoins); // prints the coins of what user searched.

  }
        
})