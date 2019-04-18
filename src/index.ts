/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

import * as OfficeHelpers from '@microsoft/office-js-helpers';

$(document).ready(async () => {

  $("#createtable").click(() => tryCatch(setup));

  $("#addrows").click(() => tryCatch(addRow));
  $("#calculatecosts").click(() => tryCatch(addCostColumns));
  $("#add-calculated-column").click(() => tryCatch(addCalculatedColumn));
  $("#updatesku").click(() => tryCatch(updateSku));

  try {
    await Excel.run(async context => {
        /**
         * Insert your Excel code here
         */
        const range = context.workbook.getSelectedRange();

    
    // look for existing table
    const sheet = context.workbook.worksheets.getItem("Sample");
    const expensesTable = sheet.tables.getItemOrNullObject("ExpensesTable");
    
    await context.sync();

    if (expensesTable != null) {
      console.log('table found');
      expensesTable.onSelectionChanged.add(onSelectionChange);
    } else {
      console.log('clean start')
    }
    await context.sync();
  
    });
} catch (error) {
    OfficeHelpers.UI.notify(error);
    OfficeHelpers.Utilities.log(error);
}
});

// The initialize function must be run each time a new page is loaded
Office.initialize = (reason) => {
  $('#sideload-msg').hide();
  $('#app-body').show();


};

async function run() {
  try {
            await Excel.run(async context => {
                /**
                 * Insert your Excel code here
                 */
                const range = context.workbook.getSelectedRange();

            // Read the range address
            range.load('address');

            // Update the fill color
            range.format.fill.color = 'yellow';

            await context.sync();
            console.log(`The range address was ${range.address}.`);
            });
        } catch (error) {
            OfficeHelpers.UI.notify(error);
            OfficeHelpers.Utilities.log(error);
        }
}

async function updateSku(skuname: string) {
  await Excel.run(async (context) => {
  // Get Selection
 
  


  const range = context.workbook.getSelectedRange();
    range.load("address");

    await context.sync();
    range.values = [[ skuname ]];
    console.log(`The address of the selected range is "${range.address}"`);
  });
}

async function addRow() {
  await Excel.run(async (context) => {
    const sheet = context.workbook.worksheets.getItem("Sample");
    const expensesTable = sheet.tables.getItem("ExpensesTable");
    // check # of columns & Headers
    const headerRange = expensesTable.getHeaderRowRange().load("values");
    const bodyRange = expensesTable.getDataBodyRange().load("values");

    await sheet.context.sync();
    const columns = headerRange.values;
    const colcount = columns[0].length;
    var newrow = []
    for (var i in columns[0]) {
      let columntitle = columns[0][i];
      switch (columntitle) {
        case "Region":
          newrow.push("eastus");
          break;
        case "Sku Name":
          newrow.push("Standard_A8_v2");
          break;
        case "Type":
          newrow.push("vm");
          break;
        case "Priority":
          newrow.push("normal");
          break;
        case "OS":
          newrow.push("Windows");
          break;
        case "Quantity":
          newrow.push(1);
          break;
        default:
          newrow.push("");
      }
    }
    expensesTable.rows.add(null, [
      newrow
    ]);

    sheet.getUsedRange().format.autofitColumns();
    sheet.getUsedRange().format.autofitRows();

    await context.sync();
  });
}

async function addCostColumns() {
  await Excel.run(async (context) => {
    const sheet = context.workbook.worksheets.getItem("Sample");
    const expensesTable = sheet.tables.getItem("ExpensesTable");

    const headerRange = expensesTable.getHeaderRowRange().load("values");
    const bodyRange = expensesTable.getDataBodyRange().load("values");

    var columns = expensesTable.columns.load();
    await sheet.context.sync();
    for (var i in columns.items) {
      switch (columns.items[i].name) {
        case "Monthly Cost":
          var monthlycostcolumn = expensesTable.columns.getItem('Monthly Cost');
          monthlycostcolumn.delete();
        break;
        case "Annual Cost":
          var annualcostcolumn = expensesTable.columns.getItem('Annual Cost');
          annualcostcolumn.delete();
        break;
      }
    }

    
    

    // TODO fix if additional columns are added
    const regionRange = expensesTable.columns
    .getItem("Region")
    .getDataBodyRange()
    .load("values");
    const skuRange = expensesTable.columns
    .getItem("Sku Name")
    .getDataBodyRange()
    .load("values");
    const typeRange = expensesTable.columns
    .getItem("Type")
    .getDataBodyRange()
    .load("values");
    const priorityRange = expensesTable.columns
    .getItem("Priority")
    .getDataBodyRange()
    .load("values");
    const osRange = expensesTable.columns
    .getItem("OS")
    .getDataBodyRange()
    .load("values");
    const quantityRange = expensesTable.columns
    .getItem("Quantity")
    .getDataBodyRange()
    .load("values");

    await sheet.context.sync();

    const rows = bodyRange.values;

    const regions = regionRange.values;
    const skus = skuRange.values;
    const types = typeRange.values;
    const priorities = priorityRange.values;
    const osvalues = osRange.values;
    const quantities = quantityRange.values;
    const output = await calculateCosts(regions,skus,types,priorities,osvalues,quantities);
    

    let newcolumn = [["Monthly Cost"]];
    // for (var i=0; i< rowcount; i++ ) {
    //   newcolumn.push(["1"]);
    // }
    // need to load first
    // assert output is 1+rowcount.length
    for (var i in rows ) {
      newcolumn.push([output[i].monthlycost]);
    }



    expensesTable.columns.add(null, newcolumn);
    //expensesTable.columns.add(null, [["Base Cost"], ["Yes"], ["Yes"], ["No"], ["No"], ["Yes"], ["Yes"]]);
    
    sheet.getUsedRange().format.autofitColumns();
    sheet.getUsedRange().format.autofitRows();

    await context.sync();
    await addCalculatedColumn();
  });
}
async function calculateCosts(regions,skus,types,priorities,osvalues,quantities) {
 
  var input = [];
  for (var i in regions) {

      input.push( {
        "location": regions[i][0],
        "name": skus[i][0],
        "hours": 730,
        "type": types[i][0],
        "priority": priorities[i][0],
        "os": osvalues[i][0],
        "quantity": quantities[i][0]
      });
  }
  var requestbody = JSON.stringify(input);

  let endpoint = 'https://mzratecardfunc.azurewebsites.net/api/costmodel?code=FGhUffy0jIaVwck4uQ4kdHSTav4RUr3yMUtNIT/fOzyeff/MpeS/Kw=='
  try {

    const result = await $.ajax({
      url: endpoint,
      data: JSON.stringify(input),
      contentType: 'application/json',
      type: 'POST',
      dataType: 'json',
      error: function(xhr, status, error) {
          // error
        }
    });
    return result.costs;
  } catch (error) {
    console.error(error);
  }
  
}


async function addCalculatedColumn() {
  await Excel.run(async (context) => {
    const sheet = context.workbook.worksheets.getItem("Sample");
    const expensesTable = sheet.tables.getItem("ExpensesTable");

    const headerRange = expensesTable.getHeaderRowRange().load("values");
    const bodyRange = expensesTable.getDataBodyRange().load("values");

    await sheet.context.sync();
    const rowcount = bodyRange.values;

    const annualcostFormula = '=[@Monthly Cost] * 12'
    let newcolumn = [["Annual Cost"]];
    for (var i in rowcount ) {
      newcolumn.push([annualcostFormula]);
    }

    expensesTable.columns.add(null, newcolumn);

    sheet.getUsedRange().format.autofitColumns();
    sheet.getUsedRange().format.autofitRows();

    await context.sync();
  });
}

/** Create a new table with sample data */
async function setup() {
  await Excel.run(async (context) => {
    await OfficeHelpers.ExcelUtilities.forceCreateSheet(context.workbook, "Sample");

    const sheet = context.workbook.worksheets.getItem("Sample");
    const expensesTable = sheet.tables.add("A1:F1", true /*hasHeaders*/);
    expensesTable.name = "ExpensesTable";
    expensesTable.getHeaderRowRange().values = [["Region", "Sku Name", "Type", "Priority", "OS", "Quantity"]];

    expensesTable.rows.add(null /*add at the end*/, [
      ["eastus", "Standard_A8_v2", "vm", "normal", "Windows", 1],
      ["eastus", "Standard_A8_v2", "vm", "normal", "Windows", 1],
      ["eastus", "Standard_A8_v2", "vm", "normal", "Windows", 1]
    ]);
    expensesTable.onSelectionChanged.add(onSelectionChange);

    if (Office.context.requirements.isSetSupported("ExcelApi", 1.2)) {
      sheet.getUsedRange().format.autofitColumns();
      sheet.getUsedRange().format.autofitRows();
    }

    sheet.activate();
    await context.sync();
  });
}

/** Default helper for invoking an action and handling errors. */
async function tryCatch(callback) {
  try {
    await callback();
  } catch (error) {
    // Note: In a production add-in, you'd want to notify the user through your add-in's UI.
    console.error(error);
  }
}
async function getSkus(region: string) {

  // get selection

  // get region
  
  //https://mzratecardfunc.azurewebsites.net/api/cost/eastus/Standard_A8?code=94PmLQSkKSRctaaIUzaCIL4VB7h7pvraC23NmlukSwJkVze6H8E3qA==
  let endpoint = 'https://mzratecardfunc.azurewebsites.net/api/cost/' + region + '?code=94PmLQSkKSRctaaIUzaCIL4VB7h7pvraC23NmlukSwJkVze6H8E3qA=='
  try {

    const result = await $.ajax({
      url: endpoint,
      type: 'GET',
      dataType: 'json',
      error: function(xhr, status, error) {
          // error
        }
    });
    return result;
  } catch (error) {
    console.error(error);
  }

}
async function onSelectionChange(args) {
  await Excel.run(async (context) => {
    console.log("Handler for table onSelectionChanged event has been triggered. The new selection is: " 
      + args.address + " " + args.tableId);
    const sheet = context.workbook.worksheets.getItem("Sample");
    const expensesTable = sheet.tables.getItem("ExpensesTable");

    const regionRange = expensesTable.columns
    .getItem("Region")
    .getDataBodyRange().load();

    const skuRange = expensesTable.columns
    .getItem("Sku Name")
    .getDataBodyRange().load();
    await context.sync();
    let selectedindex = skuRange.rowIndex;
    let region = regionRange.values[selectedindex][0];
    let selectedaddress = skuRange.address.split('!')[1];
    console.log(selectedaddress[0] == args.address[0]);
    if (selectedaddress[0] == args.address[0]) {
      // change list in UI
      let skus = await getSkus(region);
      let skuhtml = '';
      for (var i in skus) {
        skuhtml += '<div class="ms-Grid-row"><div class="ms-Grid-col ms-sm6 ms-md4 ms-lg2"><span class="updatesku" class="ms-Button-label">';
        skuhtml += skus[i].name;
        skuhtml += '</span></div></div>';
      }

      $("#skulist").html(skuhtml);



      $(".updatesku").each(function(index,element) {
        element.addEventListener("click", (x) => tryCatch(updateSku(element.innerText)))
      });

    } else {
      $('#skulist').html('');
    }
  });
  
}

