// ==UserScript==
// @name         Realistic Gravity
// @namespace    Captain_D1
// @version      0.1.0
// @description  Adds realistic gravity with air resistance to scroll bars. Inspired from https://github.com/Ineptitech/gravity.js/blob/master/gravity.js
// @author       Captain_D1
// @match        *://*/*
// ==/UserScript==

(function() {
    'use strict';

    // Constants for physics
    let BOUNCE_AMOUNT = 0.8;
    let ACCEL_MULT = 0.05;
    let TIMESTEP = 10;
    let DRAG_MULT = 0.001;

    let velocity = 0;
    let onScrollBar = false;

    // Get position based on scroll position from bottom
    let getPosition = function() {
        return maxPosition() - document.documentElement.scrollTop;
    };

    // Updates scroll position using distance from bottom
    let setPosition = function(newPos) {
        document.documentElement.scrollTop = maxPosition() - newPos;
    };

    // Returns max scroll height
    let maxPosition = function() {
        return document.documentElement.scrollHeight - document.documentElement.clientHeight
    };

    // Adapted from https://github.com/Ineptitech/gravity.js/blob/master/gravity.js
    // Checks if a click is on the scrollbar
    let clickedOnScrollbar = function(mouseX) {
        if (document.body.clientWidth <= mouseX) {
            return true;
        }
        return false;
    };

    // Adapted from https://github.com/Ineptitech/gravity.js/blob/master/gravity.js
    // Disables physics when scrollbar is clicked
    window.onmousedown = function(e) {
        onScrollBar = clickedOnScrollbar(e.clientX);
    };

    // Technically not from https://github.com/Ineptitech/gravity.js/blob/master/gravity.js
    // but it happens to be there, too.
    // Restores physics when mouse is released
    window.onmouseup = function() {
        onScrollBar = false;
    };

    // Disable physics for 100ms after pressing Home, End, Page Up, or Page Down to allow scrolling
    window.onkeydown = function(e) {
        if(e.which >= 33 && e.which <= 36) {
            onScrollBar = true;
            setTimeout(function() {onScrollBar = false;}, 100);
        }
    };

    // Perform animation
    let animationStep = function() {

        // Cancel if currently scrolling
        if (onScrollBar) return;

        let position = getPosition();

        // Calculate acceleration (actually force, but I'm saying mass = 1. idk why I actually included 9.8 in there, at this point it's arbitrary.)
        let acceleration = ACCEL_MULT * (-9.8 + DRAG_MULT * Math.exp(-position/maxPosition()) * velocity * velocity) * TIMESTEP;

        // If scrollbar on bottom of page and acceleration would negate bounce velocity, cancel velocity
        if(position <= 0 && velocity < -acceleration) {
            velocity = 0;
            return;
        };

        // Update velocity and position
        velocity += acceleration;
        position += velocity;

        // If touching ground, perform bounce
        if (position < 0) {
            position = 0;
            if (velocity < 0) {
                velocity *= -BOUNCE_AMOUNT;
            }
        }

        // Actually update scroll position
        setPosition(position);
    };

    setInterval(animationStep, TIMESTEP);
})();
