// ==UserScript==
// @name         Hotstar Tokenizer
// @namespace    https://github.com/PreciousWarrior
// @version      0.1
// @description  Login to Hotstar without having to use your mobile phone OTP every time 
// @author       IamPrecious
// @match        https://www.hotstar.com/*
// @icon         https://secure-media.hotstar.com/web-assets/prod/D+H_favicon.ico
// @require      https://raw.githubusercontent.com/uzairfarooq/arrive/master/minified/arrive.min.js
// @require      https://cdn.jsdelivr.net/npm/js-cookie@rc/dist/js.cookie.min.js
// @grant        none
// ==/UserScript==

// Taken from https://stackoverflow.com/a/33928558
// Copies a string to the clipboard. Must be called from within an
// event handler such as click. May return false if it failed, but
// this is not always possible. Browser support for Chrome 43+,
// Firefox 42+, Safari 10+, Edge and Internet Explorer 10+.
// Internet Explorer: The clipboard feature may be disabled by
// an administrator. By default a prompt is shown the first
// time the clipboard is used (per session).
function copyToClipboard(text) {
    if (window.clipboardData && window.clipboardData.setData) {
        // Internet Explorer-specific code path to prevent textarea being shown while dialog is visible.
        return window.clipboardData.setData("Text", text);

    }
    else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
        var textarea = document.createElement("textarea");
        textarea.textContent = text;
        textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in Microsoft Edge.
        document.body.appendChild(textarea);
        textarea.select();
        try {
            return document.execCommand("copy");  // Security exception may be thrown by some browsers.
        }
        catch (ex) {
            console.warn("Copy to clipboard failed.", ex);
            return false;
        }
        finally {
            document.body.removeChild(textarea);
        }
    }
}


(function () {
    'use strict';
    console.log("TOKENIZER: Started")

    //runs when element with login-container class is rendered
    document.arrive(".login-container", element => {
        console.log("TOKENIZER: The login page just arrived!")

        const orElem = document.createElement("div");
        orElem.innerHTML = "or"
        orElem.classList = "or-div"
        element.append(orElem)

        const loginElem = document.createElement("button");
        loginElem.type = "button";
        loginElem.innerHTML = "Login via Token";
        loginElem.classList = "email-or-fb-signin"

        loginElem.onclick = () => {
            const token = window.prompt("Enter your hotstar token: ");
            if (!token) {
                return
            }
            //match base64
            if (!token.match(/[A-Za-z0-9+/=]/)) {
                alert("Please enter a hotstar token in a valid format.")
                return
            }

            //cookie needs to match previous path and details or it wont work, and cookie metadata cant be easily fetched, only the values
            //cookies make my blood boil
            //Also, js-cookie doesnt automatically get the current path for some reason
            //This part of the code is likely to be the most error prone, resulting in dupe cookies or other garbage

            const url = new URL(window.location.href);
            Cookies.set('userUP', token, { path: url.pathname, expires: 365, sameSite: 'None', secure: true });
            window.location.reload();
        }

        element.append(loginElem)

    })

    document.arrive(".security-info", element => {
        console.log("TOKENIZER: The hotstar security info container panel has arrived!")
        element = element.childNodes[0];

        const copyButton = document.createElement("button");
        copyButton.type = "button";
        copyButton.innerHTML = "Copy Token to Clipboard 📋";
        copyButton.classList = "sign-out-link";

        copyButton.onclick = () => {
            const token = Cookies.get('userUP');
            if (!copyToClipboard(token)) {
                alert("Could not copy-paste token automatically. Please select and copy it manually-: " + token);
            }
        }

        const copyButtonDiv = document.createElement("div");
        copyButtonDiv.classList = "account-card-item";
        copyButtonDiv.appendChild(copyButton);

        element.insertBefore(copyButtonDiv, element.childNodes[0]);
    })

})();