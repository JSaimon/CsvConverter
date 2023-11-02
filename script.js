const csvTextArea = document.querySelector(".csvText");
const jsonTextArea = document.querySelector(".jsonText");
const convertButton = document.querySelector(".convertButton");
const errorMessageSpan = document.querySelector(".errorMessage");

const sampleCsvData = "AAAA;BBBB;CCCC;DDDD";
const separator = ";";

csvTextArea.addEventListener("focus", function () {
  csvTextArea.classList.add("focused");

  if (jsonTextArea.classList.contains("focused"))
    jsonTextArea.classList.remove("focused");
});

jsonTextArea.addEventListener("focus", function () {
  jsonTextArea.classList.add("focused");

  if (csvTextArea.classList.contains("focused"))
    csvTextArea.classList.remove("focused");
});

convertButton.addEventListener("click", function (event) {
  event.preventDefault();
  if (csvTextArea.classList.contains("focused")) {
    convertCsvToJson();
  }

  if (jsonTextArea.classList.contains("focused")) {
    convertJsonToCsv();
  }
});

const convertCsvToJson = function () {
  const csvData = csvTextArea.value;
  const isValidCsv = _isCsvDataValid(csvData);

  // Checks that the value in the area is valid
  if (isValidCsv) {
    // Separates the data in a List of arrays
    const csvDataList = _convertDataToList(csvData);
    // Converts the data to the JSON
    const jsonText = _convertValuesToJson(csvDataList);
    // Shows the JSON in the JSON Textarea
    jsonTextArea.innerHTML = jsonText;
  }

  _showHideError(isValidCsv);
};

const convertJsonToCsv = function () {
  let jsonData = jsonTextArea.value;
  jsonData = `[{"a":"b"}, {"a":"b", "c":"d"}]`;
  // Checks if the value in the area is valid
  try {
    // Converts the text to a JSON object
    const parsedJsonData = JSON.parse(jsonData);
    _generateCsvData(parsedJsonData);
  } catch (error) {
    console.error("Invalid json", error);
  }
  // Stores the object indexes
  // Writes the CSV text
  // Shows the text in the CSV Textarea
};

const _generateCsvData = function (parsedJsonData) {
  let csvColumns = new Set();
  let csvData = [];
  parsedJsonData.forEach((element, index) => {
    let csvRow = "";
    for (const [key, value] of Object.entries(element)) {
      csvColumns.add(key);
      csvRow += `${value}${separator}`;
    }
    console.log(csvColumns);
    console.log(csvRow);
  });
};

//#region Private Methods (CSV)

const _isCsvDataValid = function (csvData) {
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

const _convertDataToList = function (csvData) {
  const csvDataList = csvData.split("\n");
  const separatedCsvDataList = [];

  csvDataList.forEach((element, index) => {
    separatedCsvDataList[index] = element.split(separator);
  });

  return separatedCsvDataList;
};

const _formatJsonText = function (columnNames, element) {
  let jsonText = "\t{\n";

  columnNames.forEach((col, i) => {
    jsonText += `\t\t"${col}": "${element[i]}"${
      i === columnNames.length - 1 ? "" : ","
    }\n`;
  });

  jsonText += "\t}";

  return jsonText;
};

const _convertValuesToJson = function (csvList) {
  const csvColumnNames = csvList.shift();
  let jsonText = "[\n";

  csvList.forEach((element, index) => {
    jsonText += _formatJsonText(csvColumnNames, element);
    jsonText += index === csvList.length - 1 ? "" : ",\n";
  });

  jsonText += "\n]";

  return jsonText;
};

const _showHideError = function (hideError) {
  const errorMessage =
    "ERROR: The CSV format is invalid, please check it again!";
  errorMessageSpan.innerHTML = errorMessage;

  if (hideError) {
    csvTextArea.classList.remove("error");
    errorMessageSpan.classList.add("hidden");
  } else {
    csvTextArea.classList.add("error");
    errorMessageSpan.classList.remove("hidden");
    jsonTextArea.innerHTML = "";
  }
};

//#endregion
