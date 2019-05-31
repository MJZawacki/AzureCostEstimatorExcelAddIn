import { Component, ViewChild, AfterViewInit, NgZone } from '@angular/core';
//import { Component, OnInit } from '@angular/core';
import * as OfficeHelpers from '@microsoft/office-js-helpers';
import { Sku, SkusService } from './costs/skus.service';
import { InputRow } from './InputRow/InputRow.component'
const template = require('./app.component.html');
import { Observable } from 'rxjs';
@Component({
    selector: 'app-home',
    template
})


export default class AppComponent implements AfterViewInit {
    constructor(private skuService: SkusService, private _ngZone: NgZone)
    {
        this.inputRow.region = 'eastus';
        this.inputRow.sku = 'V8'
    }

    welcomeMessage = 'Welcome';
    selectedIndex;
    // @ViewChild(InputRow) inputRow: InputRow;
    inputRow: InputRow = new InputRow();

    async ngAfterViewInit(): Promise<void> {


        try {

            await Excel.run(async context => {


                const sheet = context.workbook.worksheets.getItem("Cost Model");
                var expensesTable = context.workbook.tables.getItem("ExpensesTable");



                const skuRange = expensesTable.columns
                .getItem("Sku Name")
                .getDataBodyRange().load();
                const skuBinding = context.workbook.bindings.add(skuRange, "Range", "Skus");

                const skuSelections = Observable.fromEventPattern(
                    async function addHandler(handler) {
                        await Excel.run(async (context) => {
                            skuBinding.onSelectionChanged.add(handler as (args: Excel.BindingSelectionChangedEventArgs) => Promise<any>);
                            context.sync();
                        });

                    },
                    async function removeHandler(handler) {
                        await Excel.run(async (context) => {
                            skuBinding.onSelectionChanged.remove(handler as (args: Excel.BindingSelectionChangedEventArgs) => Promise<any>);
                            context.sync();
                        });
                    }
                );


                skuSelections.subscribe(args => this.onSelectionChange(args));

                // check to see if sku name is selected and update skulist

                if (Office.context.requirements.isSetSupported("ExcelApi", 1.2)) {
                    sheet.getUsedRange().format.autofitColumns();
                    sheet.getUsedRange().format.autofitRows();
                }


                await context.sync();

                });
        } catch (error) {
            OfficeHelpers.UI.notify(error);
            OfficeHelpers.Utilities.log(error);
        }
    }




    async  addRow() {
        await Excel.run(async (context) => {
        const sheet = context.workbook.worksheets.getItem("Cost Model");
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

    async  addCostColumns() {
        await Excel.run(async (context) => {
        const sheet = context.workbook.worksheets.getItem("Cost Model");
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
        await this.skuService.calculateCosts(regions,skus,types,priorities,osvalues,quantities)
                    .subscribe(async costs => {

                        let newcolumn = [["Monthly Cost"]];
                        // for (var i=0; i< rowcount; i++ ) {
                        //   newcolumn.push(["1"]);
                        // }
                        // need to load first
                        // assert output is 1+rowcount.length
                        for (var i in rows ) {
                            newcolumn.push([costs[i].monthlycost]);
                        }



                        expensesTable.columns.add(null, newcolumn);
                        //expensesTable.columns.add(null, [["Base Cost"], ["Yes"], ["Yes"], ["No"], ["No"], ["Yes"], ["Yes"]]);

                        sheet.getUsedRange().format.autofitColumns();
                        sheet.getUsedRange().format.autofitRows();

                        await context.sync();
                        await this.addCalculatedColumn();
                    })


        });
    }



    async addCalculatedColumn() {
        await Excel.run(async (context) => {
        const sheet = context.workbook.worksheets.getItem("Cost Model");
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
    async createTable() {
        await Excel.run(async (context) => {
        await OfficeHelpers.ExcelUtilities.forceCreateSheet(context.workbook, "Cost Model");

        const sheet = context.workbook.worksheets.getItem("Cost Model");
        const expensesTable = sheet.tables.add("A1:F1", true /*hasHeaders*/);
        expensesTable.name = "ExpensesTable";
        expensesTable.getHeaderRowRange().values = [["Region", "Sku Name", "Type", "Priority", "OS", "Quantity"]];

        expensesTable.rows.add(null /*add at the end*/, [
            ["eastus", "Standard_A8_v2", "vm", "normal", "Windows", 1],
            ["eastus", "Standard_A8_v2", "vm", "normal", "Windows", 1],
            ["eastus", "Standard_A8_v2", "vm", "normal", "Windows", 1]
        ]);

        const skuRange = expensesTable.columns
        .getItem("Sku Name")
        .getDataBodyRange().load();
        const skuBinding = context.workbook.bindings.add(skuRange, "Range", "Skus");

        const skuSelections = Observable.fromEventPattern(
            async function addHandler(handler) {
                await Excel.run(async (context) => {
                    skuBinding.onSelectionChanged.add(handler as (args: Excel.BindingSelectionChangedEventArgs) => Promise<any>);
                    context.sync();
                });

            },
            async function removeHandler(handler) {
                await Excel.run(async (context) => {
                    skuBinding.onSelectionChanged.remove(handler as (args: Excel.BindingSelectionChangedEventArgs) => Promise<any>);
                    context.sync();
                });
            }
        );

            //skuSelections.subscribe(x => console.log(x));
            skuSelections.subscribe(args => this.onSelectionChange(args));
            //skuBinding.onSelectionChanged.add(this.onSelectionChange);


        if (Office.context.requirements.isSetSupported("ExcelApi", 1.2)) {
            sheet.getUsedRange().format.autofitColumns();
            sheet.getUsedRange().format.autofitRows();
        }

        sheet.activate();
        await context.sync();
        });
    }

    /** Default helper for invoking an action and handling errors. */
    async tryCatch(callback) {
        try {
        await callback();
        } catch (error) {
        // Note: In a production add-in, you'd want to notify the user through your add-in's UI.
        console.error(error);
        }
    }

    async updateSku(sku) {
        console.log(`updating ${sku}`);
        var selectedIndex = this.selectedIndex;
        Excel.run(async function(context) {

      
            
            const range = context.workbook.getSelectedRange();
            range.load("address");

            await context.sync();
            range.values = [[ sku.name ]];
           
            await context.sync();
            
            //skuRange.values = [[ sku.name ]];
            // console.log(`The address of the selected range is "${range.address}"`);
        });
    }

    async onSelectionChange(args) {
        console.log(args);
        var nextInput = new InputRow();
        var response = await Excel.run(async function (context) {
        console.log("Handler for table onSelectionChanged event has been triggered. The new selection is: "
            + args.address + " " + args.tableId);
        const sheet = context.workbook.worksheets.getItem("Cost Model");
        const expensesTable = sheet.tables.getItem("ExpensesTable");

        const regionRange = expensesTable.columns
        .getItem("Region")
        .getDataBodyRange().load();

        await context.sync();
        let selectedindex = args.startRow;
        let region = regionRange.values[selectedindex][0];

            return { region: region, selectedIndex: selectedindex };
        });
        this._ngZone.run(() => {
            nextInput.region = response.region;
            this.selectedIndex = response.selectedIndex;
            this.inputRow = nextInput;
        })
    }
}