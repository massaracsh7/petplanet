const buttons = document.querySelectorAll(".store__category-button");
const API_URL = 'https://pet-planet-api.onrender.com';
const productList = document.querySelector(".store__list");
const buttonCart = document.querySelector(".store__cart-button");
const modalOverlay = document.querySelector(".modal-overlay");
const cartList = document.querySelector(".modal__cart-list");
const modalCloseButton = document.querySelector(".modal-overlay__close-button");
const cartCount = document.querySelector(".store__cart-num");
const cartTotalPriceElement = document.querySelector('.modal__cart-price');
const cartForm = document.querySelector('.modal__cart-form');

const orderMessageElement = document.createElement('div');
orderMessageElement.classList.add('order-message');

const orderMessageText = document.createElement('p');
orderMessageText.classList.add('order-message__text');

const orderMessageButton = document.createElement('button');
orderMessageButton.classList.add('order-message__button');
orderMessageButton.textContent = "Закрыть";

orderMessageElement.append(orderMessageText, orderMessageButton);

orderMessageButton.addEventListener("click", () => {
  orderMessageElement.remove();
});

const createProductCard = (product) => {
  const productCard = document.createElement('li');
  productCard.classList.add('store__item');
  productCard.innerHTML = `<article class="store__product product">
                <img src="${API_URL}${product.photoUrl}" alt=${product.name} class="product__img" width="388" height="261">
                <h3 class="product__title">${product.name}</h3>
                <p class="product__price">${product.price}&nbsp;₽</p>
                <button class="product__btn-add" data-id="${product.id}">Заказать</button>
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


const changeCategory = ({ target }) => {
  const category = target.textContent;
  buttons.forEach((button) => {
    button.classList.remove("store__category-button_active");
  });
  target.classList.add("store__category-button_active");
  fetchProductByCategory(category);
}

const fetchCartItems = async (ids) => {
  try {
    const response = await fetch(`${API_URL}/api/products/list/${ids.join(",")}`);
    if (!response.ok) {
      throw new Error(response.status);
    }
    return await response.json();
  }
  catch (error) {
    console.error('Error fetch');
  }
}

const calculateTotalPrice = (cartItems, products) =>
  cartItems.reduce((acc, item) => {
    const product = products.find(prod => prod.id === item.id);
    return acc + product.price * item.count;
  }, 0);

const renderCartItem = async () => {
  cartList.textContent = '';
  const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
  const products = JSON.parse(localStorage.getItem("cartProductDetails") || "[]");
  products.forEach(({ id, photoUrl, name, price }) => {
    const cartItem = cartItems.find(item => item.id === id)
    if (!cartItem) {
      return;
    };
    const listItem = document.createElement('li');
    listItem.classList.add('modal__cart-item');
    listItem.innerHTML = `
              <img class="modal__cart-img" src="${API_URL}${photoUrl}" alt="${name}">
              <h3 class="modal__cart-title">${name}</h3>
              <div class="modal__cart-count">
                <button class="modal__minus modal__signs" data-id=${id}>-</button>
                <span class="modal__count">${cartItem.count}</span>
                <button class="modal__plus modal__signs" data-id=${id}>+</button>
              </div>
              <p class="modal__cart-item-price">${price * cartItem.count}&nbsp;₽</p>
`;

    cartList.append(listItem);
  });
  const totalPrice = calculateTotalPrice(cartItems, products);
  cartTotalPriceElement.innerHTML = `${totalPrice}&nbsp;₽`;
};

buttons.forEach((button) => {
  button.addEventListener("click", changeCategory);
  if (button.classList.contains('store__category-button_active')) {
    fetchProductByCategory(button.textContent);
  }
});

buttonCart.addEventListener("click", async () => {
  modalOverlay.style.display = 'flex';
  const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
  const ids = cartItems.map(item => item.id);
  if (!ids.length) {
    cartItems.textContent = '';
    const listItem = document.createElement('li');
    listItem.textContent = 'Cart is empty';
    cartItems.append(listItem);
    return;
  }
  const products = await fetchCartItems(ids);
  localStorage.setItem("cartProductDetails", JSON.stringify(products));
  renderCartItem();
})

modalOverlay.addEventListener("click", ({ target }) => {
  if (target === modalOverlay || target.closest('.modal-overlay__close-button')) {
    modalOverlay.style.display = 'none';
  }
});

const updateCartCount = () => {
  const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
  cartCount.textContent = cartItems.length;
}

updateCartCount();

const addToCart = (productId) => {
  const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
  const existingItem = cartItems.find((item) => item.id === productId);
  if (existingItem) {
    existingItem.count += 1;
  } else {
    cartItems.push({
      id: productId,
      count: 1
    });
  }

  localStorage.setItem("cartItems", JSON.stringify(cartItems));
  updateCartCount();
};

productList.addEventListener("click", ({ target }) => {
  if (target.closest(".product__btn-add")) {
    const productId = target.dataset.id;
    addToCart(productId);
  }
});

const updateCartItem = (productId, change) => {
  const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
  const itemIndex = cartItems.findIndex((item) => item.id === productId);

  if (itemIndex !== -1) {
    cartItems[itemIndex].count += change;

    if (cartItems[itemIndex].count <= 0) {
      cartItems.splice(itemIndex, 1);
    }

    localStorage.setItem("cartItems", JSON.stringify(cartItems));
    updateCartCount();
    renderCartItem();
  }
}

cartList.addEventListener("click", ({ target }) => {
  if (target.classList.contains("modal__plus")) {
    const productId = target.dataset.id;
    updateCartItem(productId, 1);
  }

  if (target.classList.contains("modal__minus")) {
    const productId = target.dataset.id;
    updateCartItem(productId, -1);
  }
})

const submitOrder = async (e) => {
  e.preventDefault();
  const storeId = cartForm.store.value;
  const cartItem = JSON.parse(localStorage.getItem("cartItem") || "[]");
  const products = cartItem.map(({ id, count }) => ({
    id,
    quantity: count,
  }));

  try {
    const response = await fetch(`${API_URL}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ storeId, products }),
    });
    if (!response.ok) {
      throw new Error(response.status);
    }
    const { orderId } = await response.json();
    localStorage.removeItem("cartItems");
    localStorage.removeItem("cartProductDetails");

    orderMessageText.textContent = `Ваш заказ оформлен, номер ${orderId}`;
    document.body.append(orderMessageElement);

    modalOverlay.style.display = "none";
    updateCartCount();
  } catch (error) {
    console.error(`Error order: ${error}`);
  }
}

cartForm.addEventListener("submit", submitOrder);