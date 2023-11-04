const XLSX = require('xlsx');
const fs = require('fs');

const workbook = XLSX.readFile("./example.xlsx");

async function getLinks() {
    let arrayLinks = new Array();

    workbook.SheetNames.forEach((sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        const sheetData = XLSX.utils.sheet_to_json(sheet);
        arrayLinks = sheetData;
    });
    return arrayLinks;
}

module.exports = getLinks;