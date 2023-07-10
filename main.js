"use strict";

(() => {

  const currenciesLink = document.getElementById("currenciesLink");
  const liveReportsLink = document.getElementById("liveReportsLink");
  const aboutLink = document.getElementById("aboutLink");
  const mainContent = document.getElementById("mainContent");

  // displays the currencies when pressing currencies button;
  currenciesLink.addEventListener("click", displayCurrencies);
  
  async function displayCurrencies() {
    const spinner = document.getElementById("spinner");

    spinner.style.display = "inline-block";

    const coins = await getJson("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1");
    printCoins(coins);

    spinner.style.display = "none";
  
  }
  
  // diplays the live reports page when clicked
  liveReportsLink.addEventListener("click", displayLiveReports);
  
  function displayLiveReports() {
    mainContent.innerHTML = `<img src="assets/underConstruction.png">`
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

  // gets the data from the api and returns json of the data
  async function getJson(url) {

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("response is not okay");
      }

      const json = await response.json();
      return json;

    } catch (error) {
      console.error("Error fetching JSON:", error);
      throw error;
    }

  }

  // prints the coins in cards (card container from bootstrap)
  function printCoins(coins) {

    const mainContent = document.getElementById("mainContent");
    let html = "";

    for (const coin of coins) {
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

    // after being in currencies page you can access the More Info button here
    const moreInfoButtons = document.getElementsByClassName("more-info-button");
    for (let i = 0; i < moreInfoButtons.length; i++) {
    moreInfoButtons[i].addEventListener("click", displayMoreInfo);
    }

    displayCoinsInModal(coins);

  }
  
  // when pressing the More Info button it adds the data (collapse + -)
  async function displayMoreInfo() {

    event.preventDefault();

    const button = this;
    const coinId = button.getAttribute("data-coin-id");
    const coinName = button.getAttribute("data-coin-name");
            

    const spinner = document.getElementById(`spinnerId${coinId}`);
    spinner.style.display = "inline-block";

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

    spinner.style.display = "none";

  };

  // search input top right - searching by coin name or coin symbol
  const searchForm = document.getElementById("searchForm");
  searchForm.addEventListener("input", search);

  function search() {
    const searchInput = document.getElementById("searchInput");
    const query = searchInput.value;

    searchCoins(query);

  }

  async function searchCoins(query) {
    const coins = await getJson("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1");

    const filteredCoins = coins.filter((coin) => {
      return coin.name.toLowerCase().includes(query.toLowerCase()) || coin.symbol.toLowerCase().includes(query.toLowerCase());
    });

    printCoins(filteredCoins);

  }

  // all the code above is fixed for now
  // need to work on the code below - finish modal popping up after 5 choosen coin


    ///////////////////////////////////////////////////////
    /////////////////// SWITCH BUTTON LOGIC ///////////////////////////
    function displayCoinsInModal(coins) {
        const checkedCoins = [];
        for (const coin of coins) {
            const coinsSwitchBtn = document.getElementById(`${coin.market_cap_rank}`);
            coinsSwitchBtn.addEventListener("click", function () {
                const checkedCoin = this.id;
                if (this.checked) {
                    if (+checkedCoin === +coin.market_cap_rank && checkedCoins.length < 5) {
                        checkedCoins.push(coins[(checkedCoin - 1)]);
                    } else {
                        showLimitReachedModal(checkedCoins);
                        this.checked = false;
                    }
                } else {
                    const index = (checkedCoin -1);
                    if (index > -1) {
                        checkedCoins.splice(index, 1);
                        console.log(checkedCoins);
                    }
                }
                })
        }

        const limitReachedModal = document.getElementById("limitReachedModal");
        function showLimitReachedModal(checkedCoins) {
            let html = "";
            for (const coin of checkedCoins) {
                const coinName = coin.id;
                const coinId = coin.market_cap_rank;
                html += `
                <div class="modal-container">
                <div class="cards-container">
                <div class="card">
                <img src="${coin.image}">
                <div class="card-body">
                <h5 class="card-title">${coin.symbol.toUpperCase()}</h5>
                <p class="card-text">${coin.name}</p>
                <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" role="switch" id="${coinId}" checked>
                <label class="form-check-label" for="flexSwitchCheckDefault"></label>
                </div>
                </div>
                </div>
                </div>
                </div>
                <br>`                
            }

            const limitReachedModalBody = limitReachedModal.querySelector(".modal-body");
            limitReachedModalBody.innerHTML = html; 

            const modalSwitches = limitReachedModalBody.getElementsByClassName("form-check-input");
            for (const modalSwitch of modalSwitches) {
              modalSwitch.addEventListener("click", function () {
                const index = this.id;
                checkedCoins.splice((index - 1), 1);
                console.log(checkedCoins);
                $(limitReachedModal).modal("hide");
              });
            }
            $(limitReachedModal).modal("show");
        }

          const limitReachedModalCloseBtn = limitReachedModal.querySelector(".btn-secondary");
          limitReachedModalCloseBtn.addEventListener("click", function () {
            $(limitReachedModal).modal("hide");
          });        
    }
        
})()