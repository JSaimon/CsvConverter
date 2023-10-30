console.log("hello");

const csvTextArea = document.querySelector(".csvText");
const jsonTextArea = document.querySelector(".jsonText");
const convertButton = document.querySelector(".convertButton");

const sampleCsvData = "AAAA;BBBB;CCCC;DDDD";
const separator = ";";

convertButton.addEventListener("click", function (event) {
  event.preventDefault();
  const value = csvTextArea.value;
  console.log(value);
  convertCsvToJson();
});

const isCsvDataValid = function (csvData) {
  const firstRowData = csvData.split("\n")[0];
  let isValid = false;
  if (csvData && csvData !== "") {
    if (
      firstRowData.slice(-1) === separator ||
      firstRowData.slice(0, 1) === separator
    ) {
      isValid = false;
    } else {
      isValid = true;
    }
  }

  return isValid;
};

const convertDataToList = function (csvData) {
  const csvDataList = csvData.split("\n");
  const separatedCsvDataList = [];

  csvDataList.forEach((element, index) => {
    separatedCsvDataList[index] = element.split(separator);
  });

  return separatedCsvDataList;
};

const formatJsonText = function (columnNames, element) {
  let jsonText = "\t{\n";

  columnNames.forEach((col, i) => {
    jsonText += `\t\t"${col}": "${element[i]}"${
      i === columnNames.length - 1 ? "" : ","
    }\n`;
  });

  jsonText += "\t}";

  return jsonText;
};

const convertValuesToJson = function (csvList) {
  const csvColumnNames = csvList.shift();
  let jsonText = "[\n";

  csvList.forEach((element, index) => {
    jsonText += formatJsonText(csvColumnNames, element);
    jsonText += index === csvList.length - 1 ? "" : ",\n";
  });

  jsonText += "\n]";

  return jsonText;
};

const convertCsvToJson = function () {
  const csvData = csvTextArea.value;
  // Checks that the value in the area is valid
  if (isCsvDataValid(csvData)) {
    // Separates the data in a List of arrays
    const csvDataList = convertDataToList(csvData);
    // Converts the data to the JSON
    const jsonText = convertValuesToJson(csvDataList);
    // Shows the JSON in the JSON Textarea
    jsonTextArea.innerHTML = jsonText;
  } else {
    // Show error
  }
};
