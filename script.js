const csvTextArea = document.querySelector(".csvText");
const jsonTextArea = document.querySelector(".jsonText");
const separatorSelect = document.querySelector(".separator");
const convertButton = document.querySelector(".convertButton");
const downloadButton = document.querySelector(".downloadButton");
const errorMessageSpan = document.querySelector(".errorMessage");
const inputFile = document.querySelector(".inputfile");
const orWriteText = document.querySelector(".orWriteText");

const sampleCsvData = "AAAA;BBBB;CCCC;DDDD\naaaa;bbbb;cccc;dddd";
const sampleJsonData = `[{"a":"b"}, {"a":"b", "c":"d"}]`;

const orWriteTextOriginal = "or write your text in the text boxes below";

//#region Event Listeners

inputFile.addEventListener("change", function () {
  _hideDownloadButton();
  if (inputFile.files) {
    convertFile();
  }
});

separatorSelect.addEventListener("change", function () {
  _hideDownloadButton();
});

csvTextArea.addEventListener("focus", function () {
  csvTextArea.classList.add("focused");
  orWriteText.innerHTML = orWriteTextOriginal;
  _enableConvertButton();

  if (jsonTextArea.classList.contains("focused"))
    jsonTextArea.classList.remove("focused");
});

csvTextArea.addEventListener("input", function () {
  _hideDownloadButton();
  if (!_isCsvDataFormatValid(csvTextArea.value)) {
    csvTextArea.classList.add("error");
    _disableConvertButton();
  } else {
    _resetError();
    _enableConvertButton();
  }
});

jsonTextArea.addEventListener("focus", function () {
  jsonTextArea.classList.add("focused");
  orWriteText.innerHTML = orWriteTextOriginal;
  _enableConvertButton();

  if (csvTextArea.classList.contains("focused"))
    csvTextArea.classList.remove("focused");
});

jsonTextArea.addEventListener("input", function () {
  _hideDownloadButton();
  try {
    JSON.parse(jsonTextArea.value);
    _resetError();
    _enableConvertButton();
  } catch {
    jsonTextArea.classList.add("error");
    console.log(convertButton.classList);
    _disableConvertButton();
  }
});

convertButton.addEventListener("click", function () {
  _resetError();

  if (csvTextArea.classList.contains("focused")) {
    convertCsvToJson(csvTextArea.value);
  }

  if (jsonTextArea.classList.contains("focused")) {
    convertJsonToCsv(jsonTextArea.value);
  }
});

downloadButton.addEventListener("click", function () {
  const dateTime = new Date();
  let fileName = `${dateTime.getFullYear()}_${
    dateTime.getMonth() + 1
  }_${dateTime.getDate()}_`;
  let fileToStore;

  if (csvTextArea.classList.contains("focused")) {
    fileName += "CSV.csv";
    fileToStore = new Blob([csvTextArea.value], { type: "text/csv" });
  }

  if (jsonTextArea.classList.contains("focused")) {
    fileName += "JSON.json";
    fileToStore = new Blob([jsonTextArea.value], { type: "application/json" });
  }

  window.URL = window.URL || window.webkitURL;
  downloadButton.setAttribute("href", window.URL.createObjectURL(fileToStore));
  downloadButton.setAttribute("download", fileName);
});

//#endregion

//#region Converters

const convertFile = function () {
  _resetFocus();
  const file = inputFile.files[0];
  orWriteText.innerHTML = inputFile.files[0].name;

  const reader = new FileReader();
  let fileContent = "";
  reader.addEventListener("load", function (event) {
    fileContent = event.target.result;
    if (file.type === "application/json") {
      jsonTextArea.value = fileContent;
      csvTextArea.value = "";
      convertJsonToCsv(fileContent);
      jsonTextArea.classList.add("focused");
    } else if (file.type === "text/csv") {
      csvTextArea.value = fileContent;
      jsonTextArea.value = "";
      convertCsvToJson(fileContent);
      csvTextArea.classList.add("focused");
    } else {
      _showError("ERROR: Invalid file type");
    }
  });

  reader.readAsText(file);
};

const convertCsvToJson = function (csvData) {
  const isValidCsv = _isCsvDataFormatValid(csvData);

  try {
    // Checks that the value in the area is valid
    if (isValidCsv) {
      // Separates the data in a List of arrays
      const csvDataList = _convertDataToList(csvData);

      const jsonText = _convertValuesToJson(csvDataList);

      // Shows the JSON in the JSON Textarea
      jsonTextArea.value = jsonText;
      _showDownloadButton();
    } else {
      const message = "The CSV format is invalid, please check it again!";
      throw new Error(message);
    }
  } catch (error) {
    _showError(`ERROR: ${error}`, csvTextArea);
    _disableConvertButton();
  }
};

const convertJsonToCsv = function (jsonData) {
  // Checks if the value in the area is valid
  try {
    const parsedJsonData = JSON.parse(jsonData);
    const csvText = _generateCsvData(parsedJsonData);

    // Shows the text in the CSV Textarea
    csvTextArea.value = csvText;
    _showDownloadButton();
  } catch {
    const message = "ERROR: The JSON format is invalid, please check it again!";
    _showError(message, jsonTextArea);
    _disableConvertButton();
  }
};
//#endregion

//#region Private methods (Shared)

const _showError = function (message, textArea) {
  errorMessageSpan.innerHTML = message;
  if (textArea) {
    textArea.classList.add("error");
  }
};

const _resetError = function () {
  if (csvTextArea.classList.contains("error")) {
    csvTextArea.classList.remove("error");
  }

  if (jsonTextArea.classList.contains("error")) {
    jsonTextArea.classList.remove("error");
  }

  errorMessageSpan.innerHTML = "";
};

const _resetFocus = function () {
  if (csvTextArea.classList.contains("focused")) {
    csvTextArea.classList.remove("focused");
  }

  if (jsonTextArea.classList.contains("focused")) {
    jsonTextArea.classList.remove("focused");
  }
};

const _disableConvertButton = function () {
  convertButton.setAttribute("disabled", true);
};

const _enableConvertButton = function () {
  convertButton.removeAttribute("disabled");
};

const _showDownloadButton = function () {
  downloadButton.style.display = "inline-block";
};

const _hideDownloadButton = function () {
  downloadButton.style.display = "none";
};

//#endregion

//#region Private Methods (CSV)

const _isCsvDataFormatValid = function (csvData) {
  const separator = separatorSelect.value;
  const firstRowData = csvData.split("\n")[0];
  let isValid = false;
  if (csvData.length > 0) {
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
  const separator = separatorSelect.value;
  const normalizedCsvData = csvData.replaceAll('"', "");
  const csvDataList = normalizedCsvData.split("\n");
  const separatedCsvDataList = [];

  csvDataList.forEach((element, index) => {
    separatedCsvDataList[index] = element.split(separator);
  });

  return separatedCsvDataList;
};

const _formatJsonText = function (columnNames, element) {
  let jsonText = "\t{\n";

  columnNames.forEach((col, i) => {
    jsonText += `\t\t"${col}": "${element[i] === undefined ? "" : element[i]}"${
      i === columnNames.length - 1 ? "" : ","
    }\n`;
  });

  jsonText += "\t}";

  return jsonText;
};

const _convertValuesToJson = function (csvList) {
  // Allows the creation of the JSON creating just the column names
  if (csvList.length < 2) {
    csvList.push("");
  }

  const csvColumnNames = csvList.shift();
  let jsonText = "[\n";

  csvList.forEach((element, index) => {
    jsonText += _formatJsonText(csvColumnNames, element);
    jsonText += index === csvList.length - 1 ? "" : ",\n";
  });

  jsonText += "\n]";

  return jsonText;
};

//#endregion

//#region Private Methods (JSON)

const _generateCsvData = function (parsedJsonData) {
  let csvColumns = new Set();
  let csvData = [];
  parsedJsonData.forEach((element, index) => {
    const separator = separatorSelect.value;
    let csvRow = "";
    for (const [key, value] of Object.entries(element)) {
      // Stores the object indexes
      csvColumns.add(key);
      csvRow += `${value}${separator}`;
    }
    csvData[index] = csvRow.slice(0, -1);
  });

  // Writes the CSV text
  let csvText = `${[...csvColumns].join(";")}\n`;
  csvText += _writeCsvRows(csvData);

  return csvText;
};

const _writeCsvRows = function (csvRowsArray) {
  let csvRowsText = "";
  csvRowsArray.forEach((element) => {
    csvRowsText += `${element}\n`;
  });
  return csvRowsText.trim();
};

//#endregion
