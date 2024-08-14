const buttons = document.querySelectorAll(".store__category-button");
const API_URL = 'https://pet-planet-api.onrender.com';
const productList = document.querySelector(".store__list");
const buttonCart = document.querySelector(".store__cart-button");
const modalOverlay = document.querySelector(".modal-overlay");
const cartList = document.querySelector(".modal__cart-list");
const modalCloseButton = document.querySelector(".modal-overlay__close-button");
const cartCount = document.querySelector(".store__cart-num");

const createProductCard = (product) => {
  const productCard = document.createElement('li');
  productCard.classList.add('store__item');
  productCard.innerHTML = `<article class="store__product product">
                <img src="${API_URL}${product.photoUrl}" alt=${product.name} class="product__img" width="388" height="261">
                <h3 class="product__title">${product.name}</h3>
                <p class="product__price">${product.price}&nbsp;₽</p>
                <button class="product__btn-add">Заказать</button>
              </article>`;
  return productCard;
};

const renderProducts = (products) => {
  productList.textContent = '';
  products.forEach((product) => {
    const productCard = createProductCard(product);
    productList.append(productCard);
  })
}

const fetchProductByCategory = async (category) => {
  try {
    const response = await fetch(`${API_URL}/api/products/category/${category}`);
    if (!response.ok) {
      throw new Error(response.status);
    }
    const products = await response.json();

    renderProducts(products);
  }
  catch (error) {
    console.error(`Ошибка запроса товаров ${error}`);
  }
}


const changeCategory = ({target}) => {
  const category = target.textContent;
  buttons.forEach((button) => {
    button.classList.remove("store__category-button_active");
  });
  target.classList.add("store__category-button_active");
  fetchProductByCategory(category);
}

const renderCartItem = () => {
  cartList.textContent = '';
  const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
  cartItems.forEach((item) => {
    const itemLi = document.createElement('li');
    itemLi.textContent = item;
    cartList.append(itemLi);
  })
}

buttons.forEach((button) => {
  button.addEventListener("click", changeCategory);
  if (button.classList.contains('store__category-button_active')) {
    fetchProductByCategory(button.textContent);
  }
});

buttonCart.addEventListener("click", () => {
  modalOverlay.style.display = 'flex';
  renderCartItem();
})

modalOverlay.addEventListener("click", ({target}) => {
  if (target === modalOverlay || target.closest('.modal-overlay__close-button')) {
    modalOverlay.style.display = 'none';
  }
});

const updateCartCount = () => {
  const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
  cartCount.textContent = cartItems.length;
}

updateCartCount();

const addToCart = (productName) => {
  const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
  cartItems.push(productName);
  localStorage.setItem("cartItems", JSON.stringify(cartItems));
  updateCartCount();
};

productList.addEventListener("click", ({target}) => {
  if (target.closest(".product__btn-add")) {
    const productCard = target.closest(".store__product");
    const productName = productCard.querySelector(".product__title").textContent;
    addToCart(productName);
  }
});