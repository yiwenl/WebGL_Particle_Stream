// ColorsThemes.js

ColorThemes = {};

ColorThemes.themes = [
	["#415457","#5F7B7F","#9ACCAF","#E6EBC4","#F9F7C8"],
	["#141215","#FFFFFE","#D6C4B0","#63575A","#484A4F"],
	["#32313F","#A9C5DA","#F3EFE6","#F06F4F","#747371"],
	["#E6E2AF","#A7A37E","#EFECCA","#046380","#002F2F"],
	["#FCFFF5","#D1DBBD","#91AA9D","#3E606F","#193441"],
	["#B9121B","#4C1B1B","#F6E497","#FCFAE1","#BD8D46"],
	["#105B63","#FFFAD5","#FFD34E","#DB9E36","#BD4932"],
	["#DC3522","#D9CB9E","#374140","#2A2C2B","#1E1E20"],
	["#292929","#5B7876","#8F9E8B","#F2E6B6","#412A22"],
	["#595241","#B8AE9C","#FFFFFF","#ACCFCC","#8A0917"],
	["#80BDB6","#F7EAC0","#DB979A","#736673","#E3C590"]
];

ColorThemes.getRandomTheme = function() {
	return ColorThemes.themes[ Math.floor(Math.random() * ColorThemes.themes.length)];
}