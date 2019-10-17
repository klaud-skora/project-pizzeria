import BaseWidget from './BaseWidget.js';
import utils from '../utils.js';
import { select, settings } from '../settings.js';
//import flatpickr from 'flatpickr'; - o co z tym chodzi i czemu nie działa?

class DatePicker extends BaseWidget {
  constructor(wrapper) {
    super(wrapper, utils.dateToStr(new Date()));

    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.datePicker.input);
    thisWidget.initPlugin();
  }
  initPlugin() {
    const thisWidget = this;

    thisWidget.minDate = new Date(thisWidget.value);
    thisWidget.maxDate = utils.addDays(thisWidget.minDate, settings.datePicker.maxDaysInFuture);

    const options = {
      defaultDate: thisWidget.minDate,
      minDate: thisWidget.minDate,
      maxDate: thisWidget.maxDate,
      'disable': [
        function(date) {
          return (date.getDay() === 1);
        }
      ],
      'locale': {
        'firstDayOfWeek': 1
      },
      onChange: function(selectedDate, dateStr, instance) {
        thisWidget.value = dateStr;
        console.log('dateStr', dateStr);
        console.log('instance', instance);
        console.log('selectedDate', selectedDate);
      }
    };
    // eslint-disable-next-line no-undef
    flatpickr(thisWidget.dom.input, options); //jak inaczej(komentarz dla eslinta), definicja wczesniej?
  }
  parseValue(value) {
    return(value);
  }
  isValid() {
    return true;
  }
  renderValue() {
  }
}

export default DatePicker;
