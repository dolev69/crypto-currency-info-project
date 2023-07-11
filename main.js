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
    mainContent.innerHTML = `<img src="assets/underConstruction.png">` // Live Reports page under construction image.
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
    sessionStorage.setItem("coinsData" , JSON.stringify(coins));
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

                          <input class="form-check-input" type="checkbox" role="switch" id="${coin.market_cap_rank}">

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

    $(document).on("change", ".form-check-input[type='checkbox']", function () {
      const checkedCoins = $(".form-check-input[type='checkbox']:checked"); // every checked coin

      if (checkedCoins.length > 5) { // 5 is the limit - if tries to reach more than the limit = showing showLimitReachedModal up.

        $(this).prop("checked", false);
        showLimitReachedModal(checkedCoins);

      }
    });

    mainContent.innerHTML = html;

    // after being in currencies page you can access the More Info button here
    $(".more-info-button").on("click", displayMoreInfo); // every more info button. when clicked it calls displayMoreInfo

  }

  // modal popping up after 5 checked coins
  const limitReachedModal = document.getElementById("limitReachedModal");
  function showLimitReachedModal(checkedCoins) {

    checkedCoins.each(function () {

      let element = $(this);
      let coin = {};

      coin.image = element.find("img").attr("src");
      coin.symbol = element.find("h5").text();
      coin.name = element.find("p.card-text").text();

      const html =
      `
      <div class="modal-container">

        <div class="cards-container">

          <div class="card">

            <img src="${coin.image}">

              <div class="card-body">

                <h5 class="card-title">${coin.symbol.toUpperCase()}</h5>

                <p class="card-text">${coin.name}</p>

                  <div class="form-check form-switch">

                    <input class="form-check-input" type="checkbox" role="switch" checked>
                    <label class="form-check-label" for="flexSwitchCheckDefault"></label>

                  </div>

              </div>

          </div>

        </div>

      </div>

      <br>
      `

      const limitReachedModalBody = limitReachedModal.querySelector(".modal-body");
      limitReachedModalBody.innerHTML = html; // GET http://127.0.0.1:5500/undefined 404 (Not Found)

    })

    $(limitReachedModal).modal("show"); // not shows all the 5 checked
      
    // CLOSE BTN in the modal
    const limitReachedModalCloseBtn = limitReachedModal.querySelector(".btn-secondary");

      limitReachedModalCloseBtn.addEventListener("click", function () {

        $(limitReachedModal).modal("hide"); // when clicking close - hides the modal.

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
            
    if (moreInfoContent.classList.contains("show")) {
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
  searchForm.addEventListener("input", search);

  function search() {
    const searchInput = document.getElementById("searchInput");
    const userSearch = searchInput.value;

    searchCoins(userSearch);

  }

  async function searchCoins(userSearch) {
    const coins = await getJson("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1");

    const filteredCoins = coins.filter((coin) => {
      return coin.name.toLowerCase().includes(userSearch.toLowerCase()) || coin.symbol.toLowerCase().includes(userSearch.toLowerCase());
    });

    printCoins(filteredCoins); // prints the coins of what user searched.

  }
        
})