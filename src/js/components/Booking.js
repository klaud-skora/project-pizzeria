import {select, templates } from '../settings.js';
import AmountWidget from './AmountWidget.js';

class Booking {
  constructor(booking) {
    const thisBooking = this;

    thisBooking.render(booking);
    thisBooking.initWidgets();
  }

  render(booking) {
    const thisBooking = this;

    /* generate HTML with templates.bookingWidgets */
    const generatedHTML = templates.bookingWidget();
    console.log('generatedHTML', generatedHTML);
    /* create empty object thisBooking.dom and store property wrapper */
    thisBooking.dom = {};

    thisBooking.dom.wrapper = booking;
    console.log(' thisBooking.dom.wrapper', thisBooking.dom.wrapper);
    thisBooking.dom.wrapper.innerHTML = generatedHTML;
    thisBooking.dom.peopleAmount = document.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);
  }
  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
  }
}

export default Booking;
