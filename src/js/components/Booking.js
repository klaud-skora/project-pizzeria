import { select, templates, settings, classNames } from '../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';
import utils from '../utils.js';

class Booking {
  constructor(booking) {
    const thisBooking = this;

    thisBooking.render(booking);
    thisBooking.initWidgets();
    thisBooking.getData();

  }
  getData() {
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };
    const urls = {
      booking:       settings.db.url + '/' + settings.db.booking
                                     + '?' + params.booking.join('&'),

      eventsCurrent: settings.db.url + '/' + settings.db.event
                                     + '?' + params.eventsCurrent.join('&'),

      eventsRepeat:  settings.db.url + '/' + settings.db.event
                                     + '?' + params.eventsRepeat.join('&'),
    };

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allResponses) {
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      }).then(function([bookings, eventsCurrent, eventsRepeat]) {
        //console.log(bookings);
        //console.log(eventsCurrent);
        //console.log(eventsRepeat);

        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });

  }
  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;

    thisBooking.booked = {};

    //console.log('bookings', bookings);

    for (let item of bookings) {
      //console.log('item', item);
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    for (let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for (let item of eventsRepeat) {
      if (item.repeat == 'daily') {
        for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) {
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }
    thisBooking.updateDOM();

  }
  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    if (typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {

      if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }
      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  durationValidator(reservationHour) {
    const thisBooking = this;

    const availableTime = settings.hours.close - reservationHour;
    const duration = parseFloat(thisBooking.hoursAmount.value);
    let timeForBooking = 0.5;

    if (availableTime >= duration) {
      for (let pickedTime = reservationHour; pickedTime < reservationHour + duration; pickedTime += 0.5) {
        if (typeof thisBooking.booked[thisBooking.datePicker.value][pickedTime] == 'undefined') {
          thisBooking.booked[thisBooking.datePicker.value][pickedTime] = [];
        }
        if (thisBooking.booked[thisBooking.datePicker.value][pickedTime].indexOf(thisBooking.tableChosen) == -1) {
          timeForBooking += 0.5;
        } else {
          break;
        }
      }
      if (timeForBooking >= duration) {
        return true;
      } else {
        window.alert('This table is available only for ' + timeForBooking + ' hours.');
        return false;
      }
    } else {
      window.alert('Sorry, we are closing at midnight.');
    }
  }

  updateDOM() {
    const thisBooking = this;

    thisBooking.starters = [];

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);
    let allAvailable = false;

    if (
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ) {
      allAvailable = true;
    }

    for (let table of thisBooking.dom.tables) {
      //console.log('table of at', table);
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }

      if (
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);

        /* selection of available tables */
        table.addEventListener('click', function() {
          table.classList.add(classNames.booking.tableBooked);
          thisBooking.tableChosen = tableId;
        });
      }
    }

    /* add chosen starter */
    for (let starter of thisBooking.dom.starters) {
      starter.addEventListener('change', function(event) {
        event.preventDefault();

        if (!thisBooking.starters.includes(starter.value)) {
          thisBooking.starters.push(starter.value);
        } else {
          thisBooking.starters.splice(starter.value);
        }
      });
    }
  }
  render(booking) {
    const thisBooking = this;

    /* generate HTML with templates.bookingWidgets */
    const generatedHTML = templates.bookingWidget();
    //console.log('generatedHTML', generatedHTML);

    /* create empty object thisBooking.dom and store property wrapper */
    thisBooking.dom = {};

    thisBooking.dom.wrapper = booking;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.form = thisBooking.dom.wrapper.querySelector(select.booking.form);
    thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.booking.phone);
    thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.booking.address);
    thisBooking.dom.starters = thisBooking.dom.wrapper.querySelectorAll(select.booking.starters);
  }
  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.datePicker.addEventListener('updated', function() {
      thisBooking.updateDOM();
    });

    thisBooking.dom.hourPicker.addEventListener('updated', function() {
      thisBooking.updateDOM();
    });

    thisBooking.dom.form.addEventListener('submit', function(event) {
      event.preventDefault();

      const reservation = thisBooking.durationValidator(utils.hourToNumber(thisBooking.hourPicker.value));
      console.log('reservation', reservation);
      if (reservation) {
        thisBooking.sendBooking();

        console.log('thisBooking.booked', thisBooking.booked);
      }
      //thisBooking.updateDOM();
      //thisBooking.render();
      ///thisBooking.getData();

    });
  }
  sendBooking() {
    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db.booking;

    const payload = {
      date: thisBooking.datePicker.value,
      hour: thisBooking.hourPicker.value,
      duration: thisBooking.hoursAmount.value,
      ppl: thisBooking.peopleAmount.value,
      starters: [],
      customerPhone: thisBooking.dom.phone.value,
      customerAddress: thisBooking.dom.address.value,
      table: thisBooking.tableChosen,
    };
    for (let starter of thisBooking.starters) {
      console.log(starter);
      payload.starters.push(starter);
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body:JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function(response) {
        return response.json();
      }).then(function(parsedResponse) {
        console.log('parsedResponse', parsedResponse);
      });
    thisBooking.makeBooked(payload.date, payload.hour, payload.duration, payload.table);
  }
}

export default Booking;
