import { Component, ViewChild, AfterViewInit, NgZone, Directive, ViewEncapsulation } from '@angular/core';
import * as OfficeHelpers from '@microsoft/office-js-helpers';
import { SkusService, Sku } from './skus-service.service';
import { InputRowComponent } from './input-row-component/input-row-component.component'
import { fromEventPattern } from 'rxjs';
import { MatDialog } from '@angular/material';
import { SettingsDialogComponent } from './settings-dialog/settings-dialog.component';

export interface SettingsDialogData {
    region: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./app.component.css',
      '../../node_modules/office-ui-fabric-js/dist/css/fabric.min.css',
      '../../node_modules/office-ui-fabric-js/dist/css/fabric.components.css',
      '../../node_modules/@angular/material/prebuilt-themes/indigo-pink.css'
    ]
})
export class AppComponent {

  
  
  constructor(public dialog: MatDialog, private skuService: SkusService, private _ngZone: NgZone)
  {
    this.showProgress=false;
  }

  defaultRegion = 'eastus'
  openDialog(): void {
    const dialogRef = this.dialog.open(SettingsDialogComponent, {
      width: '300px',
      height: '400px',
      position: {
          top: '100',
          left: '100'
      },
      data: {region: this.defaultRegion}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if (result !== undefined) {
          // valid region?

          // update region
          this.defaultRegion = result.region;
      }
    });
  }


  welcomeMessage = 'Welcome';
  selectedIndex;
  showProgress;

  inputRow: InputRowComponent = new InputRowComponent();

  async ngAfterViewInit(): Promise<void> {


      try {

          await Excel.run(async context => {


              const sheet = context.workbook.worksheets.getItemOrNullObject("Cost Model");
              var expensesTable = context.workbook.tables.getItemOrNullObject("ExpensesTable");

              await context.sync();
              if (sheet.isNullObject) {
                  // Create Sheet & Table
                  this._setup(context);
              } else if (expensesTable.isNullObject) {
                  // Create Table
                  this._setup(context, sheet);
              } else {
                this._setup(context, sheet, expensesTable);
              }
              
              

              });
      } catch (error) {
          if (error.code != "ItemNotFound") { 
              OfficeHelpers.UI.notify(error);
              OfficeHelpers.Utilities.log(error);

          }

          
      }
  }

  private async _requireInRegionSku(newList: string[]) {


    Excel.run(async function(context) {


        const sheet = context.workbook.worksheets.getItem("Cost Model");
        const expensesTable = sheet.tables.getItem("ExpensesTable");
        const skuRange = expensesTable.columns
        .getItem("Sku Name")
        .getDataBodyRange();
          // When you are developing, it is a good practice to
          // clear the dataValidation object with each run of your code.
          skuRange.dataValidation.clear();

          //const nameSourceRange = context.workbook.worksheets.getItem("Names").getRange("A1:A3");
      
          let approvedListRule = {
            list: {
              inCellDropDown: true,
              //source: "=Names!$A$1:$A$3"
              source: newList.toString()
            }
          };
          skuRange.dataValidation.rule = approvedListRule;
          await context.sync();
    });
  
  
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
              newrow.push(this.defaultRegion);
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
    try {
        this.progressUpdate(true);
        await Excel.run(async (context) => {
        
            const sheet = context.workbook.worksheets.getItem("Cost Model");

            const expensesTable = sheet.tables.getItem("ExpensesTable");

            const headerRange = expensesTable.getHeaderRowRange().load("values");
            const bodyRange = expensesTable.getDataBodyRange().load("values");

            var columns = expensesTable.columns.load();
            await sheet.context.sync();


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

                            sheet.getUsedRange().format.autofitColumns();
                            sheet.getUsedRange().format.autofitRows();

                            await context.sync();
                            var monthlycosts = costs.map((x) => x.monthlycost);
                            await this.updateCostColumns(monthlycosts);
                            this.progressUpdate(false);
                        })


            });
            
        }
        catch (error) {
            if (error.code != "ItemNotFound") {
                OfficeHelpers.UI.notify(error);
                OfficeHelpers.Utilities.log(error);

            }
        }
    }

  async updateCostColumns(costs: any[]) {
      try {
          return Excel.run(async (context) => {
  
              const sheet = context.workbook.worksheets.getItem("Cost Model");
              const expensesTable = sheet.tables.getItem("ExpensesTable");
      
              const costsColumn = expensesTable.columns
              .getItem("Monthly Cost")
              .getDataBodyRange();
              var columnCostsTotals = expensesTable.columns
              .getItem("Monthly Cost").getTotalRowRange().load("address");
              
              
              const annualCostsColumn = expensesTable.columns
              .getItem("Annual Cost")
              .getDataBodyRange();
              var annualCostsTotals = expensesTable.columns
              .getItem("Annual Cost").getTotalRowRange().load("address");
         
              

              const annualCostFormula = '=[@Monthly Cost] * 12';
              // @ts-ignore
              annualCostsColumn.values = annualCostFormula;
              await context.sync();
              // @ts-ignore
              annualCostsTotals.values = '=SUBTOTAL(109,[Annual Cost])';
              // @ts-ignore
              columnCostsTotals.values = '=SUBTOTAL(109,[Monthly Cost])';
              var inputarray = [];
              for (var i in costs) {
                  inputarray.push([costs[i]]);
              }
              
              costsColumn.values = inputarray;
              expensesTable.showTotals = true;

              await context.sync();
  
          });

      } catch (error) {
          OfficeHelpers.UI.notify(error);
          OfficeHelpers.Utilities.log(error);
      }
  }

  // TODO change selection handler back to worksheet and test for sku selection - empty list when not selected

  private async _setValidValues(context, range, list) {
    range.dataValidation.clear();
    let approvedListRule = {
      list: {
        inCellDropDown: true,
        source: list
      },
      
    };
    range.dataValidation.rule = approvedListRule;

    range.dataValidation.prompt = {
        message: "",
        showPrompt: false,
        title: ""
      };

      
  
  }
  /** Create a new table with sample data */
  private async _setup(context, sheet?, expensesTable?) {

    if (sheet === undefined) {
        sheet = await OfficeHelpers.ExcelUtilities.forceCreateSheet(context.workbook, "Cost Model");
    
        // await context.sync();
    }
    if (expensesTable === undefined) {
        expensesTable = sheet.tables.add("A1:H1", true /*hasHeaders*/);
        expensesTable.name = "ExpensesTable";
        expensesTable.getHeaderRowRange().values = [["Region", "Sku Name", "Type", "Priority", "OS", "Quantity", "Monthly Cost", "Annual Cost"]];
        expensesTable.rows.add(null /*add at the end*/, [
            [this.defaultRegion, "Standard_A8_v2", "vm", "normal", "Windows", 1, null, null],
            [this.defaultRegion, "Standard_A8_v2", "vm", "normal", "Windows", 1, null,null],
            [this.defaultRegion, "Standard_A8_v2", "vm", "normal", "Windows", 1, null, null]
        ]);
    
        expensesTable.showTotals = true;
        // await context.sync();
    }

    const osRange = expensesTable.columns
    .getItem("OS")
    .getDataBodyRange().load();
    this._setValidValues(context, osRange, 'Windows,Linux');
    const typeRange = expensesTable.columns
    .getItem("Type")
    .getDataBodyRange().load();
    this._setValidValues(context, typeRange, 'vm,storage');
    const priorityRange = expensesTable.columns
    .getItem("Priority")
    .getDataBodyRange().load();
    this._setValidValues(context, priorityRange, 'normal,low');
    const skuRange = expensesTable.columns
    .getItem("Sku Name")
    .getDataBodyRange().load();
    const skuBinding = context.workbook.bindings.add(skuRange, "Range", "Skus");

    const skuSelections = fromEventPattern(
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
    
  }

  async createTable() {
      await Excel.run(async (context) => {
          this._setup(context);
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

  async progressUpdate(busyFlag: boolean) {
      this.showProgress = busyFlag;
  
  }

  async updateValidSkus(skulist) {
      this._requireInRegionSku(skulist);

  }

  // TODO check to see if selection is still on a sku cell
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
      var nextInput = new InputRowComponent();
      var response = await Excel.run(async function (context) {

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
