// https://github.com/johnboy5358/localStorageLogIn.git
/*
  * Helper functions...
  * (could be in a library)
*/
"use strict";

// generic helper functions.
var qs = function qs(selectorStr) {
  return document.querySelector(selectorStr);
};
var map = function map(fn) {
  return function (coll) {
    return Array.prototype.map.call(coll, fn);
  };
};
var filter = function filter(fn) {
  return function (coll) {
    return Array.prototype.filter.call(coll, fn);
  };
};
var reduce = function reduce(fn, init) {
  return function (coll) {
    return Array.prototype.reduce.call(coll, fn, init);
  };
};
var pick = function pick(prop) {
  return function (obj) {
    return obj[prop];
  };
};

/*
  * Onload setup localStorage, initialise Redux.store and event listeners.
*/

try {
  // If localStorage does not have this property then initialise.
  if (!window.localStorage._lsLoginForm) {

    window.localStorage._lsLoginForm = JSON.stringify({
      "users": [
        {"id": "Admin",   "pwd": "AdminPassword1"},
      ] 
    })
  }

  // make a function to get id (alias username)
  var getUsername = pick('id')

  // cache the output table ref.
  var outTable = qs('#output-table')

  // get registered users from localStorage.
  var logInDat = JSON.parse(localStorage._lsLoginForm)

  // Usernames must be unique.
  var usersIndex = new Set(map(getUsername)(logInDat.users))

  // Create a Redux store object.
  var appStore = Redux.createStore(appReducer, {users:logInDat.users, index: usersIndex})

  // Show the current table
  outpHtmlTable(outTable, appStore.getState().users)

  // Display the login form
  var domLogInFormWrapper = qs('#input')
  domLogInFormWrapper.innerHTML = logInForm()

  // Listen for form click events
  var domLogInForm = qs('#loginForm')
  domLogInForm.addEventListener('submit', reactToFormClicks(domLogInForm))

  // When the store is changed run this function
  appStore.subscribe(upDate(outTable, '_lsLoginForm'))

} catch(e) {
  console.log(e.message);
}
/*
  * End onload setup.
*/


/*
  * App specific functions...
*/

function upDate (table, localStAddress) {
  console.log(localStAddress)

  return function () {

    // get the current users
    const appState = appStore.getState().users

    // Output html table.
    outpHtmlTable(table, appState)

    // Output to localStorage.
    const tmp = {"users": appState}
    localStorage[localStAddress] = JSON.stringify(tmp)
  }

}

function outpHtmlTable(target, source) {

  target.innerHTML = source.map(function (v) {
    return '\n    <tr><td>' + v.id + '</td><td>' + v.pwd + '</td></tr>\n  ';
  }).join('');
}

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function reactToFormClicks(form) {

  return function (e) {
    e.preventDefault();
    var formValid = form.checkValidity();

    if (formValid) {

      // const formInputs = form.elements
      var inputs = filter(function (v) {
        return v.dataset.input;
      })(form.elements);
      var inputObj = reduce(function (p, c) {
        return Object.assign(p, _defineProperty({}, c.id, c.value));
      }, {})(inputs);

      // if a form field is not completed
      if (Object.values(inputObj).some(function (v) {
        return !v;
      })) return false;

      // send msg to Redux reducer.
      appStore.dispatch({ type: "login", inputs: inputObj });

      // clear the form fields
      form.reset();
    }
  };
}

function appReducer(state, action) {

  switch (action.type) {
    case "login":
      // Usernames are unique; you can't have duplicates!
      if (state.index.has(action.inputs.id)) return state
      const newIdx = state.index.add(action.inputs.id)
      const newLogged = state.users
        .concat({id: action.inputs.id, pwd: action.inputs.pwd})
      state.index = newIdx
      state.users = newLogged
      return state
      break;
    default:
      console.log('No Op!')
      return state
  }
}

function logInForm() {

  return "\n    <form action=\"\" id=\"loginForm\" method=\"post\">\n      <p>\n        <label for=\"id\">Username</label>\n        <input id=\"id\"\n          name=\"username\"\n          data-input=\"user\"\n          type=\"text\"\n          pattern=\"[a-zA-Z0-9]{3,}\"\n          placeholder=\"Alphanumeric only\"\n          required=\"true\"\n        >\n\n      </p>\n\n      <p>\n        <label for=\"pwd\">Password</label>\n        <input id=\"pwd\"\n          name=\"password\"\n          data-input=\"pwd\"\n          type=\"password\"\n          pattern=\"(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}\"\n          placeholder=\"enter your password\"\n          required=\"true\"\n        >\n                \n      </p>\n      <p>\n        <input id=\"login\" type=\"submit\" name=\"login\" value=\"login\">\n      </p>\n\n      <p>password with 8 or more characters and atleast 1 uppercase letter and a number</p>\n\n    </form>\n  ";
}
