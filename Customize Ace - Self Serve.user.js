// ==UserScript==
// @name         Customize Ace - Self Serve
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  customize ace editor for self serve on TE
// @author       Nathan Kean
// @match        https://totalexpert.net/manage-media/form/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // initialize variables
    var editorEl, aceDocument, aceEditor, aceLines, aceRange, aceSession, injScript, replaceRange, removeRange;

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

    // add fix liquid button to DOM tree
    var liquidBtn = document.createElement('button');
    liquidBtn.innerHTML = "<span>Fix Liquid</span>";
    liquidBtn.type = "button";
    liquidBtn.id = "fixLiquidButton";
    liquidBtn.className = "btn btn-primary btn-sm";
    liquidBtn.style.marginLeft = "5px";

    // add swap backgrounds button to DOM tree
    var swapBtn = document.createElement('button');
    swapBtn.innerHTML = "<span>RGB <i class=\"fa fa-exchange\"></i> CMYK</span>";
    swapBtn.type = "button";
    swapBtn.id = "swapButton";
    swapBtn.className = "btn btn-primary btn-sm";
    swapBtn.style.marginLeft = "5px";

    // fix bad liquid tag formatting in html
    function fixLiquidTags(editorEl) {
        console.log('Fixing Liquid Tags');
        // set session variables
        aceSession = ace.edit(editorEl).getSession();
        aceDocument = aceSession.getDocument();
        aceLines = aceDocument.$lines;
        // find lines that end with {
        for(var i=0; i<aceLines.length; i++) {
            var line = aceLines[i];
            if(line[line.length-1] == "{") {
                var nextLine = aceLines[i+1];
                var nextLineTrim = nextLine.trim();
                if(nextLine[nextLine.length-1] == "{") {
                    nextLine = aceLines[i+3];
                    if(nextLine[nextLine.length-1] == "}") {
                        nextLine = aceLines[i+4];
                        if(nextLine[nextLine.length - 1] == "}") {
                            var fixedLine = aceLines[i] + "{" + aceLines[i+2].trim() + "}};";
                            replaceRange = new aceRange(i, 0, i, Number.MAX_VALUE);
                            aceSession.replace(replaceRange, fixedLine);
                            removeRange = new aceRange(i,Number.MAX_VALUE,i+6,Number.MAX_VALUE);
                            aceSession.remove(removeRange);
                        }
                    }
                }
                else if(nextLineTrim[0] == "%" && nextLine[nextLine.length-1] == "%") {
                    nextLine = aceLines[i+2];
                    if(nextLine[nextLine.length-1] == "}") {
                        fixedLine = aceLines[i] + aceLines[i+1].trim() + "};";
                        replaceRange = new aceRange(i, 0, i, Number.MAX_VALUE);
                        aceSession.replace(replaceRange, fixedLine);
                        removeRange = new aceRange(i,Number.MAX_VALUE,i+3,Number.MAX_VALUE);
                        aceSession.remove(removeRange);
                    }
                }
            }
        }
        // remove leftover blank lines
        var startPos = aceLines.indexOf("<style>");
        for(var j=startPos; j<aceLines.length; j++) {
            var currLine = aceLines[j];
            if(currLine[currLine.length-1] == ";") {
                nextLine = aceLines[j+1];
                if(nextLine == "") {
                    removeRange = new aceRange(j,Number.MAX_VALUE,j+1,Number.MAX_VALUE);
                    aceSession.remove(removeRange);
                }
            }
        }
    }

    // remove temp fix for HTML entity code rendering in sample.pdf
    function removeMetaTag(editorEl) {
        console.log('Checking For Meta Tag');
        aceSession = ace.edit(editorEl).getSession();
        aceDocument = aceSession.getDocument();
        aceLines = aceDocument.$lines;
        var foundMetaTag = aceLines.indexOf('<meta charset="utf-8">');
        var foundFamEssen = aceLines.indexOf("{% include 'FAM_essentials' %}");
        // if meta tag found in template
        if(foundMetaTag != -1) {
            console.log("Found meta tag on line ",foundMetaTag);
            // verify the template inlcudes FAM_essentials before removing the tag
            if(foundFamEssen != -1) {
                removeRange = new aceRange(foundMetaTag,0,foundMetaTag+1,0);
                aceSession.remove(removeRange);
            }
        }
    }

    // swap RGB and CMYK background links
    // ***Need to add check for dba version
    function swapBackground(editorEl) {
        aceSession = ace.edit(editorEl).getSession();
        aceDocument = aceSession.getDocument();
        aceLines = aceDocument.$lines;
        for(var i=0; i<aceLines.length; i++) {
            if(aceLines[i].includes('assign background_image_1')) {
                var oldBG1 = aceLines[i];
                var splitBG1 = "";
                var newBG1 = "";
                if(oldBG1.includes('-RGB.jpg')) {
                    splitBG1 = oldBG1.split('-RGB.jpg');
                    newBG1 = splitBG1[0] + '.jpg' + splitBG1[1];
                    replaceRange = new aceRange(i,0,i,Number.MAX_VALUE);
                    aceSession.replace(replaceRange, newBG1);
                } else {
                    splitBG1 = oldBG1.split('.jpg');
                    newBG1 = splitBG1[0] + '-RGB.jpg' + splitBG1[1];
                    replaceRange = new aceRange(i,0,i,Number.MAX_VALUE);
                    aceSession.replace(replaceRange, newBG1);
                }
            } else if(aceLines[i].includes('assign background_image_2')) {
                var oldBG2 = aceLines[i];
                var splitBG2 = "";
                var newBG2 = "";
                if(oldBG2.includes('-RGB2.jpg')) {
                    splitBG2 = oldBG2.split('-RGB2.jpg');
                    newBG2 = splitBG2[0] + '2.jpg' + splitBG2[1];
                    replaceRange = new aceRange(i,0,i,Number.MAX_VALUE);
                    aceSession.replace(replaceRange, newBG2);
                } else {
                    splitBG2 = oldBG2.split('2.jpg');
                    newBG2 = splitBG2[0] + '-RGB2.jpg' + splitBG2[1];
                    replaceRange = new aceRange(i,0,i,Number.MAX_VALUE);
                    aceSession.replace(replaceRange, newBG2);
                }
                break;
            }
        }
    }

    // custom settings to apply to ace editor session
    function customizeAce(editorEl) {
        console.log("Custom Ace Settings Injected");
        ace.require("ace/ext/language_tools");
        // set editor instance
        aceEditor = ace.edit(editorEl);
        // set custom options
        aceEditor.setOptions({
            cursorStyle: 'smooth',
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
            scrollPastEnd: .5,
            theme: 'ace/theme/one_dark',
            wrap: true,
        });
        aceEditor.session.setMode("ace/mode/liquid");
        aceEditor.session.$blockScrolling = Infinity;
        // fix liquid tag formatting
        fixLiquidTags(editorEl);
        // insert HTML entity fix
        removeMetaTag(editorEl);
    }

    // action for fix liquid button
    function liquidClicked() {
        fixLiquidTags(editorEl[0]);
    }

    // action for swap background button
    function swapClicked() {
        swapBackground(editorEl[0]);
    }

    // set up mutation observer for editor window
    var editorObserver = new MutationObserver(function (mutations, me) {
        // `mutations` is an array of mutations that occurred
        // `me` is the MutationObserver instance
        editorEl = document.getElementsByClassName("ace_editor");
        // when the editor window is added to the DOM, code below will execute
        if (editorEl[0]) {
            // instantiate ace range constructor
            aceRange = ace.require('ace/range').Range;
            // set editor window to half view
            var editorSplit = document.getElementsByClassName("split split-horizontal");
            for (var i=0; i<editorSplit.length; i++) {
                editorSplit[i].style.width = "calc(50% - 4px)";
            }
            // add customizations to ace
            customizeAce(editorEl[0]);
            // add swap button to header bar
            document.getElementsByClassName("ribbon-btn-container")[1].appendChild(swapBtn);
            // add event handler for injButton
            document.getElementById("swapButton").addEventListener(
                "click", swapClicked, false
            );
            // add fix liquid button to header bar
            document.getElementsByClassName("ribbon-btn-container")[1].appendChild(liquidBtn);
            // add event handler for injButton
            document.getElementById("fixLiquidButton").addEventListener(
                "click", liquidClicked, false
            );
            // stop observing
            me.disconnect();
            return;
        }
    });

    // start observing for editor window
    editorObserver.observe(document, {
        childList: true,
        subtree: true
    });
})();