import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const axios = require('axios/dist/browser/axios.cjs');
const fetchSearchBtn = document.querySelector("#search-form");
const loadMoreBtn = document.querySelector(".load-more");
const cardList = document.querySelector(".gallery");

let lightbox = new SimpleLightbox('.gallery a');
let page;
let searchObject;
let render;
let totalCards;

fetchSearchBtn.addEventListener("submit", async (event) => {
  try {
    event.preventDefault();
    page = 1;
    searchObject = "";
    render = "";
    const { elements: { searchQuery } } = event.currentTarget;
    const cards = await fetchSearch(searchQuery.value,page);
    if (cards.data.hits.length === 0) {
      Notify.failure("Sorry, there are no images matching your search query. Please try again.")
    }
    else {
      Notify.success(`Hooray! We found ${cards.data.totalHits} images!`);
      totalCards = cards.data.totalHits;
      searchObject = searchQuery.value;
      renderItems(cards.data.hits);
      loadMoreBtn.classList.remove("hidden");
    }
  }
  catch (error) {
  console.log(error.message);
  };
});


loadMoreBtn.addEventListener("click", async (event) => {
   try {
     page += 1;
     const cards = await fetchSearch(searchObject, page);
     if (totalCards < 40 * page && totalCards < 40 * (page - 1)) {
       Notify.failure("We're sorry, but you've reached the end of search results")
     }
     else {
       renderItems(cards.data.hits);

       const { height: cardHeight } = document.querySelector(".gallery")
         .firstElementChild.getBoundingClientRect();
        
       window.scrollBy({
        top: cardHeight * 2,
        behavior: "smooth",
       });
     };
   }
   catch (error) {
    console.log(error.message);
   }
});

async function fetchSearch(toSearch, toPage) {
 const baseUrl = `https://pixabay.com/api?key=34100220-38e5a3f6c25c883f1441c4bda&q=${toSearch}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${toPage}`;
 const response = await axios.get(baseUrl);
return response;
};

function renderItems(items) {
  const markup = items
    .map(
      (item) => `<a href="${item.largeImageURL}">
  <div class="photo-card">
  <img src="${item.webformatURL}" alt="${item.tags}" width="276px" height="185px" loading="lazy" />
  <div class="info">
  <div class="info-block">
    <p class="info-item">
      <b>Likes</b>
    </p>
    <p class="info-value">
      ${item.likes}
    </p>
  </div>
  <div class="info-block">
    <p class="info-item">
      <b>Views</b>
    </p>   
    <p class="info-value">
      ${item.views}
    </p>
  </div>
  <div class="info-block">
    <p class="info-item">
      <b>Comments</b>
    </p>
    <p class="info-value">
      ${item.comments}
    </p>
  </div>
  <div class="info-block">
    <p class="info-item">
      <b>Downloads</b>
    </p>
    <p class="info-value">
      ${item.downloads}
    </p>
  </div>
  </div>
</div>
</a>`
  ).join("");
  
render += markup; 
cardList.innerHTML = render;
  
lightbox.refresh();
};