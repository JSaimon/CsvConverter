const csvTextArea = document.querySelector(".csvText");
const jsonTextArea = document.querySelector(".jsonText");
const separatorSelect = document.querySelector(".separator");
const convertButton = document.querySelector(".convertButton");
const errorMessageSpan = document.querySelector(".errorMessage");

const sampleCsvData = "AAAA;BBBB;CCCC;DDDD\naaaa;bbbb;cccc;dddd";
const sampleJsonData = `[{"a":"b"}, {"a":"b", "c":"d"}]`;

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
  _resetError();

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

  try {
    // Checks that the value in the area is valid
    if (isValidCsv) {
      // Separates the data in a List of arrays
      const csvDataList = _convertDataToList(csvData);

      const jsonText = _convertValuesToJson(csvDataList);

      // Shows the JSON in the JSON Textarea
      jsonTextArea.value = jsonText;
    } else {
      const message = "The CSV format is invalid, please check it again!";
      throw new Error(message);
    }
  } catch (error) {
    _showError(`ERROR: ${error}`, csvTextArea);
  }
};

const convertJsonToCsv = function () {
  let jsonData = jsonTextArea.value;
  // Checks if the value in the area is valid
  try {
    const parsedJsonData = JSON.parse(jsonData);
    const csvText = _generateCsvData(parsedJsonData);

    // Shows the text in the CSV Textarea
    csvTextArea.value = csvText;
  } catch {
    const message = "ERROR: The JSON format is invalid, please check it again!";
    _showError(message, jsonTextArea);
  }
};

//#region Private methods (Shared)

const _showError = function (message, textArea) {
  errorMessageSpan.innerHTML = message;
  textArea.classList.add("error");
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

//#endregion

//#region Private Methods (CSV)

const _isCsvDataValid = function (csvData) {
  const separator = separatorSelect.value;
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
  const separator = separatorSelect.value;
  const csvDataList = csvData.split("\n");
  const separatedCsvDataList = [];

  csvDataList.forEach((element, index) => {
    if (element.indexOf(separator) < 0) {
      throw new Error(
        `One or more CSV values doesn't contain the separator: "${separator}"`
      );
    }

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
