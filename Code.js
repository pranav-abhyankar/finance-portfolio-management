function doGet() {
  return HtmlService.createHtmlOutputFromFile('Untitled')
    .setTitle('Stock Portfolio Dashboard')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getUsers() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = spreadsheet.getSheets();
  return sheets
    .map(sheet => sheet.getName())
    .filter(name => name.toLowerCase() !== 'sprice');
}

function fetchData(user) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(user);
  var data = {};
  var headers = ['Symbol', 'Qty', 'Average Price', 'Investment Amount', 'Live Price', 'Overall PL', 'Latest Value'];
  var spriceSheet = spreadsheet.getSheetByName('Sprice');
  var spriceData = [];
  
  if (spriceSheet) {
    spriceData = spriceSheet.getDataRange().getValues();
    console.log("Sprice sheet data loaded. Rows: " + spriceData.length);
    
    // Log first few rows of Sprice data for debugging
    for (var i = 0; i < Math.min(3, spriceData.length); i++) {
      console.log("Sprice Row " + i + ": Symbol='" + spriceData[i][0] + "', Price='" + spriceData[i][1] + "'");
    }
    
    // Remove header row if it exists (check if first row has non-numeric price)
    if (spriceData.length > 0 && (spriceData[0][1] === 'Price' || isNaN(Number(spriceData[0][1])))) {
      console.log("Removing header row from Sprice data");
      spriceData.shift();
    }
  } else {
    console.log("Warning: 'Sprice' sheet not found. Live prices will default to 0.");
  }
  
  var sheetData = sheet.getDataRange().getValues();
  console.log("User sheet '" + user + "' data loaded. Rows: " + sheetData.length);
  
  if (sheetData.length > 1) {
    sheetData.shift(); // Remove header row
  }
  
  var stocks = sheetData.map(function(row, rowIndex) {
    var rowData = {};
    headers.forEach(function(header, index) {
      rowData[header] = row[index] || '';
    });
    
    var symbol = (rowData['Symbol'] || '').toString().trim();
    console.log("Processing row " + rowIndex + " - Symbol: '" + symbol + "'");
    
    rowData['Live Price'] = vlookupPrice(symbol, spriceData);
    rowData['Qty'] = Number(rowData['Qty']) || 0;
    rowData['Average Price'] = Number(rowData['Average Price']) || 0;
    rowData['Live Price'] = Number(rowData['Live Price']) || 0;
    rowData['Investment Amount'] = rowData['Qty'] * rowData['Average Price'];
    rowData['Overall PL'] = (rowData['Live Price'] - rowData['Average Price']) * rowData['Qty'];
    rowData['Latest Value'] = rowData['Live Price'] * rowData['Qty'];
    
    console.log("Final data for " + symbol + " - Live Price: " + rowData['Live Price']);
    
    return rowData;
  });
  
  return {
    user: user,
    stocks: stocks
  };
}

function vlookupPrice(symbol, spriceData) {
  console.log("=== vlookupPrice called for symbol: '" + symbol + "' ===");
  
  if (!Array.isArray(spriceData) || spriceData.length === 0) {
    console.log("ERROR: spriceData is empty or not an array. Returning default price of 0.");
    return 0;
  }
  
  console.log("Sprice data available with " + spriceData.length + " rows");
  
  // Clean the input symbol
  var cleanSymbol = symbol.toString().trim().toUpperCase();
  console.log("Cleaned input symbol: '" + cleanSymbol + "'");
  
  // Create a price lookup map for better performance and accuracy
  var priceMap = {};
  
  for (var i = 0; i < spriceData.length; i++) {
    if (spriceData[i] && spriceData[i][0]) {
      var sheetSymbol = spriceData[i][0].toString().trim().toUpperCase();
      var price = Number(spriceData[i][1]) || 0;
      priceMap[sheetSymbol] = price;
      
      // Log first few entries for debugging
      if (i < 5) {
        console.log("Price map entry " + i + ": '" + sheetSymbol + "' -> " + price);
      }
    }
  }
  
  console.log("Total entries in price map: " + Object.keys(priceMap).length);
  
  // First try exact match
  if (priceMap.hasOwnProperty(cleanSymbol)) {
    console.log("✓ EXACT MATCH found for symbol: '" + symbol + "' -> Price: " + priceMap[cleanSymbol]);
    return priceMap[cleanSymbol];
  }
  console.log("✗ No exact match for: '" + cleanSymbol + "'");
  
  // If no exact match, try without .NS/.BO suffix
  var baseSymbol = cleanSymbol.replace(/\.(NS|BO|BSE|NSE)$/, '');
  console.log("Trying base symbol: '" + baseSymbol + "'");
  
  if (baseSymbol !== cleanSymbol && priceMap.hasOwnProperty(baseSymbol)) {
    console.log("✓ BASE SYMBOL match found for: '" + symbol + "' -> '" + baseSymbol + "' -> Price: " + priceMap[baseSymbol]);
    return priceMap[baseSymbol];
  }
  
  // Try adding .NS if not present
  if (!cleanSymbol.includes('.')) {
    var nsSymbol = cleanSymbol + '.NS';
    console.log("Trying with .NS suffix: '" + nsSymbol + "'");
    if (priceMap.hasOwnProperty(nsSymbol)) {
      console.log("✓ NS SYMBOL match found for: '" + symbol + "' -> '" + nsSymbol + "' -> Price: " + priceMap[nsSymbol]);
      return priceMap[nsSymbol];
    }
  }
  
  // Try adding .BO if not present
  if (!cleanSymbol.includes('.')) {
    var boSymbol = cleanSymbol + '.BO';
    console.log("Trying with .BO suffix: '" + boSymbol + "'");
    if (priceMap.hasOwnProperty(boSymbol)) {
      console.log("✓ BO SYMBOL match found for: '" + symbol + "' -> '" + boSymbol + "' -> Price: " + priceMap[boSymbol]);
      return priceMap[boSymbol];
    }
  }
  
  // Last resort: partial matching (case insensitive)
  console.log("Trying partial matches...");
  for (var symbolKey in priceMap) {
    if (symbolKey.indexOf(baseSymbol) !== -1 || baseSymbol.indexOf(symbolKey) !== -1) {
      console.log("✓ PARTIAL match found for symbol: '" + symbol + "' -> '" + symbolKey + "' -> Price: " + priceMap[symbolKey]);
      return priceMap[symbolKey];
    }
  }
  
  console.log("✗ NO MATCHING price found for symbol: '" + symbol + "'. Available symbols in Sprice:");
  var availableSymbols = Object.keys(priceMap).slice(0, 10); // Show first 10
  console.log(availableSymbols.join(', '));
  console.log("Returning default price of 0.");
  return 0;
}

function getCombinedData() {
  var users = getUsers();
  var combinedData = [];
  
  users.forEach(user => {
    var userData = fetchData(user);
    userData.stocks.forEach(stock => {
      stock.User = user;
      combinedData.push(stock);
    });
  });
  
  return combinedData;
}

function getOverviewData() {
  var users = getUsers();
  var overviewData = [];
  var totalEvaluation = 0;
  
  users.forEach(user => {
    var userData = fetchData(user);
    var userTotalValue = userData.stocks.reduce((sum, stock) => sum + stock['Latest Value'], 0);
    overviewData.push({
      name: user,
      value: userTotalValue
    });
    totalEvaluation += userTotalValue;
  });
  
  return {
    totalEvaluation: totalEvaluation,
    userValues: overviewData
  }
}

// Debug function to check what's in your sheets
function debugSheetData() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  
  // Check Sprice sheet
  var spriceSheet = spreadsheet.getSheetByName('Sprice');
  if (spriceSheet) {
    var spriceData = spriceSheet.getDataRange().getValues();
    console.log("=== SPRICE SHEET DEBUG ===");
    console.log("Total rows: " + spriceData.length);
    for (var i = 0; i < Math.min(5, spriceData.length); i++) {
      console.log("Row " + i + ": Symbol='" + spriceData[i][0] + "', Price='" + spriceData[i][1] + "' (type: " + typeof spriceData[i][1] + ")");
    }
  }
  
  // Check first user sheet
  var users = getUsers();
  if (users.length > 0) {
    var firstUser = users[0];
    var userSheet = spreadsheet.getSheetByName(firstUser);
    var userData = userSheet.getDataRange().getValues();
    console.log("=== USER SHEET DEBUG (" + firstUser + ") ===");
    console.log("Total rows: " + userData.length);
    for (var i = 0; i < Math.min(5, userData.length); i++) {
      console.log("Row " + i + ": " + userData[i].join(" | "));
    }
  }
}

// Helper function to validate Sprice sheet data
function validateSpriceData() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var spriceSheet = spreadsheet.getSheetByName('Sprice');
  
  if (!spriceSheet) {
    return "Sprice sheet not found!";
  }
  
  var data = spriceSheet.getDataRange().getValues();
  var issues = [];
  
  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    if (!row[0] || row[0].toString().trim() === '') {
      issues.push("Row " + (i + 1) + ": Missing symbol");
    }
    if (i > 0 && (isNaN(row[1]) || row[1] === '')) { // Skip header row check
      issues.push("Row " + (i + 1) + ": Invalid price for symbol " + row[0]);
    }
  }
  
  return issues.length > 0 ? issues.join('\n') : "Sprice data is valid!";
}