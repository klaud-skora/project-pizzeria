import { settings, select } from '../settings.js';
import BaseWidget from './BaseWidget.js';

class AmountWidget extends BaseWidget {
  constructor(element) {
    super(element, settings.amountWidget.defaultValue);

    const thisWidget = this;

    thisWidget.getElements(element);

    thisWidget.initActions();

    //console.log('amountWidget', thisWidget);
  }
  getElements() {
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
  }
  isValid(value) {

    return !isNaN(value)
    && value >= settings.amountWidget.defaultMin
    && value <= settings.amountWidget.defaultMax;

  }
  renderValue() {
    const thisWidget = this;

    thisWidget.dom.input.value = thisWidget.value;
  }
  initActions() {
    const thisWidget = this;

    thisWidget.dom.input.addEventListener('change', function() {
      //thisWidget.setValue(thisWidget.dom.input.value);
      thisWidget.value = thisWidget.dom.input.value;
    });
    thisWidget.dom.linkDecrease.addEventListener('click', function(event) {
      event.preventDefault();

      if (thisWidget.dom.linkDecrease == document.querySelector('.hours-amount a[href="#less"]')) {
        thisWidget.setValue(thisWidget.value - 0.5);
      } else {
        thisWidget.setValue(thisWidget.value - 1);
      }
    });thisWidget.dom.linkIncrease.addEventListener('click', function(event) {
      event.preventDefault();

      if (thisWidget.dom.linkIncrease == document.querySelector('.hours-amount a[href="#more"]')) {
        thisWidget.setValue(thisWidget.value + 0.5);
      } else {
        thisWidget.setValue(thisWidget.value + 1);
      }
    });
  }
}

export default AmountWidget;
