export const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '41271135-6e824ca6ffd9bf1243cba04d2';

export const options = {
  params: {
    key: API_KEY,
    q: '',
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    page: 1,
    per_page: 40,
  },
};
