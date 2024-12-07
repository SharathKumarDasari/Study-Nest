const { json } = require("express");

function first(){
    window.location.href='first.html';
}
function second(){
  window.location.href='second.html';
}
function third(){
  window.location.href='third.html';
}
function fourth(){
  window.location.href='fourth.html';
}
function home(){
  window.location.href='home.html';
}


document.addEventListener("DOMContentLoaded", () => {
  initializeSemesters([1, 2]);
});
document.addEventListener("DOMContentLoaded", () => {
  initializeSemesters([3, 4]);
});
document.addEventListener("DOMContentLoaded", () => {
  initializeSemesters([5, 6]);
});
document.addEventListener("DOMContentLoaded", () => {
  initializeSemesters([7, 8]);
});