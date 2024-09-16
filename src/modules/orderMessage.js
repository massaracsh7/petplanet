export const orderMessageElement = document.createElement('div');
orderMessageElement.classList.add('order-message');

export const orderMessageText = document.createElement('p');
orderMessageText.classList.add('order-message__text');

export const orderMessageButton = document.createElement('button');
orderMessageButton.classList.add('order-message__button');
orderMessageButton.textContent = "Закрыть";

orderMessageElement.append(orderMessageText, orderMessageButton);
