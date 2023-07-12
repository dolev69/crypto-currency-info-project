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

    mainContent.innerHTML = html;

    // event listener to every checkbox
    $(document).on("click" , ".form-check-input[type='checkbox']", function (event) {

      let checkedCoins = []; // array of all the checked coins
      let coinsList = $("#coinsList"); // div where all the checked coins will display on

      let text = "<span>Coins Selected :</span>";
      coinsList.html(text);

      $(".form-check-input[type='checkbox']:checked").each(function () {
        let coinName = $(this).closest(".card").find("h5.card-title").text(); // getting the coin name
        checkedCoins.push(coinName); // pushing the coin name to the checked coins array
      });
    
      coinsList.append(" " + checkedCoins.join(" / ")); // adding the checked coins to the coinList div

      if (checkedCoins.length > 5) { // if the user is trying to choose more than 5
        const coinsToDisplay = checkedCoins.slice(0, checkedCoins.length - 1); // all the coins excluding the last one!
        showLimitReachedModal(coinsToDisplay); // the modal popping up with the selected coins.
        event.preventDefault(); // preventing the user from selecting more
      }
    
      $(".form-check-input[type='checkbox']:not(:checked)").each(function () { // every unselected checkbox
        checkedCoins = checkedCoins.filter(c => c !== this.value); // deletes from array the unselected one.
      });

    })
    

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