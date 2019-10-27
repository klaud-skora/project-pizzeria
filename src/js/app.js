import { settings, select, classNames } from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';

const app = {


  initCarousel() {
    const thisApp = this;
    console.log(thisApp);
    const buttonArray = [];
    const buttons = document.querySelectorAll('.btn');
    const items = document.querySelectorAll('.item');

    for (let button of buttons) {
      buttonArray.push(button);
      button.addEventListener('click', function() {

        event.preventDefault();

        const activeDot = document.querySelector('.carousel_nav > .active');
        activeDot.classList.remove('active');

        button.classList.add('active');
        for (let item of items) {
          if (item.id != button.id) {
            item.classList.remove('active');
            item.classList.remove('position-one');
            item.classList.remove('position-two');
            item.classList.remove('position-three');
          }


          if (item.id == button.id) {
            item.classList.add('active');
            if (button.id == 'item1') {
              item.classList.add('position-one');
            }
            if (item.id == 'item2') {
              item.classList.add('position-two');
            }
            if (item.id == 'item3') {
              item.classList.add('position-three');
            }
          }
        }
      });
    }

    let i = 1;
    const opinionArray = [];
    const opinions = document.querySelectorAll('.item');

    for (let opinion of opinions) {
      opinionArray.push(opinion);
    }
    //console.log('opinionArray', opinionArray);


    function changeOpinion() {

      document.querySelector('.carousel').src = opinionArray[i];
      //console.log(opinionArray[i]);

      buttonArray[i].click(event);


      if (i < opinionArray.length - 1) {
        i++;
      } else {
        i = 0;
      }
    }

    window.onload = function() {
      setInterval(() => {
        changeOpinion();
      }, 3000);
    };


  },

  initBooking: function() {
    const thisApp = this;

    thisApp.booking = document.querySelector(select.containerOf.booking);

    new Booking(thisApp.booking);
  },

  initPages: function() {
    const thisApp = this;

    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    //thisApp.navLinks = document.querySelectorAll(select.nav.links);
    thisApp.navLinks = document.querySelectorAll(select.nav.sources);
    thisApp.homePage = document.querySelector(select.nav.logo);

    const idFromHash = window.location.hash.replace('#/', '');

    let pageMatchingHash =  thisApp.pages[0].id;

    for (let page of thisApp.pages) {
      if (page.id == idFromHash) {
        pageMatchingHash = page.id;
        break;
      }
    }

    thisApp.activatePage(pageMatchingHash);

    for (let link of thisApp.navLinks) {
      link.addEventListener('click', function(event) {
        const clickedElement = this;
        event.preventDefault();

        /* get page id from href attribute */
        const id = clickedElement.getAttribute('href').replace('#',  '');

        /* run thisApp.activatePage with that id */
        thisApp.activatePage(id);

        /* change URL hash */
        window.location.hash = '#/' + id;
      });
    }
    thisApp.homePage.addEventListener('click', function(event) {
      const clickedElement = this;
      event.preventDefault();

      const id = clickedElement.getAttribute('href').replace('#',  '');
      thisApp.activatePage(id);
      window.location.hash = '#/' + id;
    });

  },
  activatePage: function(pageId) {
    const thisApp = this;

    /* add class "active" to matching pages, remove from non-matching */
    for (let page of thisApp.pages) {
      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }

    /* add class "active" to matching links, remove from non-matching */
    for (let link of thisApp.navLinks) {
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') == '#' + pageId);
    }
  },
  initMenu: function() {
    const thisApp = this;
    //console.log('thisApp.data', thisApp.data);

    for (let productData in thisApp.data.products) {
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
      //////console.log('productData', productData);
    }
  },

  initData: function() {
    const thisApp = this;

    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.product;

    fetch(url)
      .then(function(rawResponse) {
        return rawResponse.json();
      })
      .then(function(parsedResponse) {

        /* save parsedResponse as thisApp.data.products */
        thisApp.data.products = parsedResponse;

        /* execute initMenu method */
        thisApp.initMenu();
      });
  },
  initCart: function() {
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', function(event) {
      app.cart.add(event.detail.product);
    });
  },

  init: function() {
    const thisApp = this;
    ////console.log('*** App starting ***');
    ////console.log('thisApp:', thisApp);
    ////console.log('classNames:', classNames);
    ////console.log('settings:', settings);
    ////console.log('templates:', templates);

    thisApp.initPages();
    thisApp.initData();
    thisApp.initCart();
    thisApp.initBooking();
    thisApp.initCarousel();
  },
};
app.init();
