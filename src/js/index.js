import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import { BASE_URL, options } from './pixabay-api.js';

// CSS
import 'simplelightbox/dist/simple-lightbox.min.css';
import '../css/styles.css';

///////////////////////////////////////////////////////////////

// DOM LINKS
const galleryEl = document.querySelector('.gallery');
const searchInputEl = document.querySelector('input[name="searchQuery"]');
const searchFormEl = document.getElementById('search-form');
const loadText = document.querySelector('.text')

///////////////////////////////////////////////////////////////

// instantiate simplelightbox
const lightbox = new SimpleLightbox('.lightbox', {
  captionsData: 'data-user',
  captionDelay: 250,
});



///////////////////////////////////////////////////////////////
let onceNotify = 0;
let totalHits = 0;
let reachedEnd = false;

function renderGallery(hits) {
  const markup = hits
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
        user,
      }) => {
        return `
              <a href="${largeImageURL}" class="lightbox">
                  <div class="photo-card">
                      <img src="${webformatURL}" alt="${tags}" loading="lazy" data-user="posted by: ${user}"/>
                      <div class="info">
                          <p class="info-item" title='likes'>
                              <b class='icon-size'>👍</b>
                              ${likes}
                          </p>
                          <p class="info-item" title='views'>
                              <b class='icon-size'>👁️‍🗨️</b>
                              ${views}
                          </p>
                          <p class="info-item" title='comments'>
                              <b class='icon-size'>🗨️</b>
                              ${comments}
                          </p>
                          <p class="info-item"  title='download'>
                              <b class='icon-size'>⬇️</b>
                              ${downloads}
                          </p>
                      </div>
                  </div>
              </a>
              `;
      }
    )
    .join('');

  galleryEl.insertAdjacentHTML('beforeend', markup);

  //   If the user has reached the end of the collection
  if (options.params.page * options.params.per_page >= totalHits) {
    if (!reachedEnd) {
      loadText.classList.replace('loader','end-loader');
      Notify.info("We're sorry, but you've reached the end of search results.");
      loadText.textContent  = 'Sorry, there are no images matching your search query. Please try again.';
      reachedEnd = true;
    }
  }
  lightbox.refresh();
}

///////////////////////////////////////////////////////////////

async function handleSubmit(e) {
  e.preventDefault();
  loadText.classList.remove('end-loader');
  loadText.textContent = '';
  options.params.q = searchInputEl.value.trim();
  if(loadText.className === 'text'){
    loadText.classList.add('loader');
  }
  if (options.params.q === '') {
    return;
  }
  options.params.page = 1;
  galleryEl.innerHTML = '';
  reachedEnd = false;

  try {
    const response = await axios.get(BASE_URL, options);
    totalHits = response.data.totalHits;

    const { hits } = response.data;

    if (hits.length === 0) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      setTimeout(()=>{
        loadText.classList.remove('loader');
      },500);
    } else {
      Notify.success(`Hooray! We found ${totalHits} images.`);
      renderGallery(hits);
    }
  } catch (err) {
    Notify.failure(err);
  }
}

searchFormEl.addEventListener('submit', handleSubmit);

///////////////////////////////////////////////////////////////

async function loadMore() {
  options.params.page += 1;
  try {
    const response = await axios.get(BASE_URL, options);
    const hits = response.data.hits;
    renderGallery(hits);
  } catch (err) {
    loadText.classList.remove('loader');
    Notify.failure('You reached the limit!');
  }
}

function handleScroll() {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

  if (scrollTop + clientHeight >= scrollHeight) {
    loadMore();
  }
}

window.addEventListener('scroll', handleScroll);
