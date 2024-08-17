import { cartCount } from './selectors.js';

export const getCartItems = () => JSON.parse(localStorage.getItem("cartItems") || "[]");

export const setCartItems = (cartItems) => localStorage.setItem("cartItems", JSON.stringify(cartItems));

export const updateCartCount = () => {
  const cartItems = getCartItems();
  cartCount.textContent = cartItems.length;
};

export const calculateTotalPrice = (cartItems, products) =>
  cartItems.reduce((acc, item) => {
    const product = products.find(prod => prod.id === item.id);
    return acc + product.price * item.count;
  }, 0);