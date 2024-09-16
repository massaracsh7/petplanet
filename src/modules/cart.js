import { API_URL } from './constants.js';
import { cartList, cartTotalPriceElement, cartForm, modalOverlay } from './selectors.js';
import { getCartItems, setCartItems, updateCartCount, calculateTotalPrice } from './utils.js';
import { orderMessageElement, orderMessageText, orderMessageButton } from './orderMessage.js';


export const addToCart = (productId) => {
  const cartItems = getCartItems();
  const existingItem = cartItems.find(item => item.id === productId);
  if (existingItem) {
    existingItem.count += 1;
  } else {
    cartItems.push({ id: productId, count: 1 });
  }
  setCartItems(cartItems);
  updateCartCount();
};

export const fetchCartItems = async (ids) => {
  try {
    const response = await fetch(`${API_URL}/api/products/list/${ids.join(",")}`);
    if (!response.ok) {
      throw new Error(response.status);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching cart items:', error);
  }
};

export const updateCartItem = (productId, change) => {
  const cartItems = getCartItems();
  const itemIndex = cartItems.findIndex(item => item.id === productId);

  if (itemIndex !== -1) {
    cartItems[itemIndex].count += change;

    if (cartItems[itemIndex].count <= 0) {
      cartItems.splice(itemIndex, 1);
    }

    setCartItems(cartItems);
    updateCartCount();
    renderCartItem();
  }
};

export const renderCartItem = async () => {
  cartList.textContent = '';
  const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]") || [];
  const products = JSON.parse(localStorage.getItem("cartProductDetails") || "[]") || [];

  if (!Array.isArray(products) || !Array.isArray(cartItems)) {
    console.error('Cart items or products are not valid arrays.');
    return;
  }

  products.forEach(({ id, photoUrl, name, price }) => {
    const cartItem = cartItems.find(item => item.id === id);
    if (!cartItem) {
      return;
    }
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
      <p class="modal__cart-item-price">${price * cartItem.count}&nbsp;₽</p>`;

    cartList.append(listItem);
  });

  const totalPrice = calculateTotalPrice(cartItems, products);
  cartTotalPriceElement.innerHTML = `${totalPrice}&nbsp;₽`;
};

export const submitOrder = async (e) => {
  e.preventDefault();
  const storeId = cartForm.store.value;
  const cartItems = getCartItems();
  const products = cartItems.map(({ id, count }) => ({ id, quantity: count }));

  try {
    const response = await fetch(`${API_URL}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeId, products }),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const { orderId } = await response.json();

    localStorage.removeItem("cartItems");
    localStorage.removeItem("cartProductDetails");

    orderMessageText.textContent = `Ваш заказ оформлен, номер ${orderId}`;
    orderMessageButton.textContent = "Закрыть";

    orderMessageElement.className = 'order-message';
    orderMessageButton.className = 'order-message__button';

    document.body.append(orderMessageElement);

    orderMessageButton.addEventListener("click", () => {
      orderMessageElement.remove(); 
    });

    modalOverlay.style.display = "none";
    updateCartCount();
  } catch (error) {
    console.error(`Error submitting order: ${error}`);
  }
};