// Code from https://github.com/stellar/laboratory/blob/master/src/utilities/clickToSelect.js
// Licensed under Apache-2.0

// DOM helper. When an element has clickToSelect and a users clicks on the element,
// then the whole element will be selected/highlighted.

// usage: <Element className="clickToSelect" onClick={clickToSelect} />
// The class is optional
export default function clickToSelect(event) {
  var range = document.createRange();
  range.selectNodeContents(event.target);
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(range);
};
