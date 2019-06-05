// ==UserScript==
// @name         Customize Ace - Snippets
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  customize ace editor for snippets page on TE
// @author       Nathan Kean
// @match        https://totalexpert.net/snippets/list
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // initialize variables
    var editorEl, aceEditor, injScript;
    var observerRunning = true;

    // inject newer versions of ace and componenets
    var newAceComponents = [
        "ace",
        "ext-language_tools",
        "ext-emmet",
        "mode-text",
        "mode-css",
        "mode-html",
        "mode-liquid",
    ];

    newAceComponents.forEach(injectScript);

    function injectScript(component) {
        injScript = document.createElement('script');
        injScript.src = "https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.4/" + component + ".js";
        document.getElementsByTagName('head')[0].appendChild(injScript);
    }

    // load one dark theme file
    injScript = document.createElement('script');
    injScript.src = "https://gitcdn.xyz/repo/nkean/ace_themes/master/one_dark.js";
    document.getElementsByTagName('head')[0].appendChild(injScript);

    // custom settings to apply to ace editor session
    function customizeAce(editorEl) {
        ace.require("ace/ext/language_tools");
        // set editor instance
        aceEditor = ace.edit(editorEl);
        // set custom options
        aceEditor.setOptions({
            cursorStyle: 'smooth',
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
            scrollPastEnd: .5,
            showPrintMargin: false,
            theme: 'ace/theme/one_dark',
            wrap: true,
        });
        aceEditor.session.setMode("ace/mode/liquid");
        aceEditor.session.$blockScrolling = Infinity;
        aceEditor.clearSelection();
    }

    // set up mutation observer for editor window
    var editorObserver = new MutationObserver(function (mutations, me) {
        // `mutations` is an array of mutations that occurred
        // `me` is the MutationObserver instance
        editorEl = document.getElementsByClassName("ace_editor");
        // when the editor window is added to the DOM, code below will execute
        if (editorEl[0]) {
            console.log("Triggered observer!");
            // add customizations to ace
            customizeAce(editorEl[0]);
            me.disconnect(); // stop observing
            observerRunning = false;
            return;
        }
    });

    // start observing for editor window
    editorObserver.observe(document, {
        childList: true,
        subtree: true
    });

    // setup mutation observer to start and stop editor observer
    var trackEditorObserver = new MutationObserver(function (mutations, me) {
        // `mutations` is an array of mutations that occurred
        // `me` is the MutationObserver instance
        editorEl = document.getElementsByClassName("ace_editor");
        // if the editor window doesn't exist and the editor observer isn't running, start it
        if(!editorEl[0] && !observerRunning){
            console.log("Starting editorObserver");
            observerRunning = true;
            editorObserver.observe(document, {
                childList: true,
                subtree: true
            });
        }
    });

    // start observing editor observer state
    trackEditorObserver.observe(document, {
        childList: true,
        subtree: true
    });
})();