import { settings, select, classNames, templates } from '../settings.js';
import utils from '../utils.js';
import CartProduct from './CartProduct.js';


class Cart {
  constructor(element) {
    const thisCart = this;

    thisCart.products = [];
    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;

    thisCart.getElements(element);
    thisCart.initActions();
  }

  getElements(element) {
    const thisCart = this;

    thisCart.dom = {};
    thisCart.dom.wrapper = element;

    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);

    thisCart.renderTotalKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee'];

    for (let key of thisCart.renderTotalKeys) {
      thisCart.dom[key] = thisCart.dom.wrapper.querySelectorAll(select.cart[key]);
    }
  }
  initActions() {
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function(event) {
      event.preventDefault();
      //console.log('thisCart.dom.wrapper', thisCart.dom.wrapper);

      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);

      thisCart.dom.productList.addEventListener('updated', function() {
        thisCart.update();
      });
    });

    thisCart.dom.productList.addEventListener('remove', function() {
      thisCart.remove(event.detail.cartProduct);
    });

    //console.log('for cart', thisCart.dom.form);
    thisCart.dom.form.addEventListener('submit', function(event) {
      event.preventDefault();

      thisCart.sendOrder();
    });
  }
  add(menuProduct) {
    const thisCart = this;
    ////console.log('thisCart in add method', thisCart);

    const generatedHTML = templates.cartProduct(menuProduct);
    //console.log('generatedHTML in cart add', generatedHTML);

    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    //console.log('generatedDOM', generatedDOM);

    thisCart.dom.productList.appendChild(generatedDOM);

    //console.log('adding product', menuProduct);

    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    //console.log('thisCart.products', thisCart.products);

    thisCart.update();
  }
  update() {
    const thisCart = this;

    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;

    for (let product of thisCart.products) {
      thisCart.subtotalPrice += product.price;
      thisCart.totalNumber += product.amount;

      console.log('totalNumber', thisCart.totalNumber);
      console.log('subtotalPrice', thisCart.subtotalPrice);

    }
    if (thisCart.subtotalPrice == 0) {
      thisCart.deliveryFee = 0;
    }
    thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;

    console.log('thisCart.totalPrice', thisCart.totalPrice);
    console.log('thisCart.renderTotalKeys', thisCart.renderTotalKeys);

    for (let key of thisCart.renderTotalKeys) {
      console.log(key);
      for (let elem of thisCart.dom[key]) {
        console.log('elem', elem);
        elem.innerHTML = thisCart[key];
      }
    }
  }
  remove(cartProduct) {
    const thisCart = this;

    const index = thisCart.products.indexOf(cartProduct);

    thisCart.products.splice(index, 1);

    cartProduct.dom.wrapper.remove();

    thisCart.update();

  }
  sendOrder() {
    const thisCart = this;

    const url = settings.db.url + '/' + settings.db.order;
    console.log('ej', thisCart);
    const payload = {
      address: 'test',
      customerPhone: thisCart.dom.phone.value,
      customerAddress: thisCart.dom.address.value,
      totalNumber: thisCart.totalNumber,
      subtotalPrice: thisCart.subtotalPrice,
      deliveryFee: thisCart.deliveryFee,
      totalPrice: thisCart.totalPrice,
      products: [],
    };

    for (let product of thisCart.products) {
      payload.products.push(product.getData());
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function(response) {
        return response.json();
      }).then(function(parsedResponse) {
        console.log('parsedResponse', parsedResponse);
      });

  }
}

export default Cart;
