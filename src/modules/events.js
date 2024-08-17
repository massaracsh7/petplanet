import { buttons, productList, buttonCart, modalOverlay, cartForm, orderMessageButton, cartList } from './selectors.js';
import { fetchProductByCategory } from './products.js';
import { addToCart, updateCartItem, submitOrder, renderCartItem, fetchCartItems } from './cart.js';
import { getCartItems} from './utils.js';


const changeCategory = ({ target }) => {
  const category = target.textContent;
  buttons.forEach(button => {
    button.classList.remove("store__category-button_active");
  });
  target.classList.add("store__category-button_active");
  fetchProductByCategory(category);
};

buttons.forEach(button => {
  button.addEventListener("click", changeCategory);
  if (button.classList.contains('store__category-button_active')) {
    fetchProductByCategory(button.textContent);
  }
});

buttonCart.addEventListener("click", async () => {
  modalOverlay.style.display = 'flex';
  const cartItems = getCartItems();
  const ids = cartItems.map(item => item.id);

  if (!ids.length) {
    cartList.textContent = 'Cart is empty';
    return;
  }

  const products = await fetchCartItems(ids);
  localStorage.setItem("cartProductDetails", JSON.stringify(products));
  renderCartItem();
});

modalOverlay.addEventListener("click", ({ target }) => {
  if (target === modalOverlay || target.closest('.modal-overlay__close-button')) {
    modalOverlay.style.display = 'none';
  }
});

productList.addEventListener("click", ({ target }) => {
  if (target.closest(".product__btn-add")) {
    const productId = target.dataset.id;
    addToCart(productId);
  }
});

cartList.addEventListener("click", ({ target }) => {
  if (target.classList.contains("modal__plus")) {
    const productId = target.dataset.id;
    updateCartItem(productId, 1);
  }

  if (target.classList.contains("modal__minus")) {
    const productId = target.dataset.id;
    updateCartItem(productId, -1);
  }
});

cartForm.addEventListener("submit", submitOrder);
orderMessageButton.addEventListener("click", () => orderMessageElement.remove());