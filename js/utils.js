'use strict'

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function hide(selector){
    document.querySelector(selector).classList.add('hide');
    var elCell = document.querySelector(selector);
}

function show(selector){
    document.querySelector(selector).classList.remove('hide');
}