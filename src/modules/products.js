import { API_URL } from './constants.js';
import { productList } from './selectors.js';

const wakeUpAPI = async () => {
  let attempt = 0;
  while (attempt < 10) {
    try {
      await fetch('https://pet-planet-api.onrender.com/api/products');
      console.log('Ok, API is awake');
      return;
    } catch (error) {
      attempt++;
      console.error(`Loading..., API is not awake`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  window.location.reload();
};


export const fetchProductByCategory = async (category) => {
  await wakeUpAPI();
  try {
    const loader = document.createElement('div');
    loader.classList.add('loader');
    loader.textContent = 'Загрузка товаров...';
    productList.textContent = '';
    productList.appendChild(loader);

    const response = await fetch(`${API_URL}/api/products/category/${category}`);
    if (!response.ok) {
      throw new Error(response.status);
    }

    const products = await response.json();
    renderProducts(products);
  } catch (error) {
    console.error(`Ошибка запроса товаров ${error}`);
  } finally {
    const loader = document.querySelector('.loader');
    if (loader) loader.remove();
  }
};

export const renderProducts = (products) => {
  productList.textContent = ''; 
  products.forEach((product) => {
    const productCard = createProductCard(product);
    productList.append(productCard);
  });
};

export const createProductCard = (product) => {
  const productCard = document.createElement('li');
  productCard.classList.add('store__item');
  productCard.innerHTML = `
    <article class="store__product product">
      <img src="${API_URL}${product.photoUrl}" alt="${product.name}" class="product__img" width="388" height="261">
      <h3 class="product__title">${product.name}</h3>
      <p class="product__price">${product.price}&nbsp;₽</p>
      <button class="product__btn-add" data-id="${product.id}">Заказать</button>
    </article>`;
  return productCard;
};
