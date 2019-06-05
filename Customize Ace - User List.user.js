// ==UserScript==
// @name         Customize Ace - User List
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  customize ace editor for snippets page on TE
// @author       Nathan Kean
// @match        https://totalexpert.net/user/list
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var buttonBar = document.getElementsByClassName("ribbon-btn-container content")[0];

    var loginBtnTM = document.createElement('a');
    loginBtnTM.id = "loginBtnTM";
    loginBtnTM.title = "Login";
    loginBtnTM.className = "btn btn-sm btn-primary js-login-btn";
    loginBtnTM.style.float = "right";
    loginBtnTM.innerHTML = "Login";
    buttonBar.append(loginBtnTM);

    var userLoginInput = document.createElement('input');
    userLoginInput.style.float = "right";
    userLoginInput.style.width = "30mm";
    userLoginInput.style.marginRight = "3mm";
    userLoginInput.className = "form-control input-sm";
    userLoginInput.setAttribute("oninput", "updateBtn(this.value)");
    userLoginInput.placeholder = "User ID";
    userLoginInput.autofocus = true;
    buttonBar.append(userLoginInput);

    userLoginInput.addEventListener("keyup", function(event) {
        if (event.keyCode === 13) {
            // Cancel the default action, if needed
            event.preventDefault();
            // Trigger the button element with a click
            document.getElementById("loginBtnTM").click();
        }
    });

    window.updateBtn = function(userID) {
        console.log(userID);
        var newLink = "/user/login/" + userID;
        document.getElementById("loginBtnTM").setAttribute("data-redirect", newLink);
    }
})();