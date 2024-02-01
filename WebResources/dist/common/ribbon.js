"use strict";
console.log(`Ribbon Script Loading...`);
var P365I_CRM;
(function (P365I_CRM) {
    var Ribbon;
    (function (Ribbon) {
        let Common;
        (function (Common) {
            async function openCustomPage(primaryControl, customPageName, customPageTitle, width, height) {
                console.log(`Ribbon Function openCustomPage Triggered`);
                const navigationOptions = {
                    target: 2,
                    position: 1,
                    width: { value: width, unit: "%" },
                    height: { value: height, unit: "%" },
                    title: customPageTitle
                };
                const customPage = {
                    pageType: "custom",
                    name: customPageName,
                    entityName: primaryControl.data.entity.getEntityName(),
                    recordId: P365I_CRM.Common.Helpers.cleanID(primaryControl.data.entity.getId()),
                };
                const customPageResult = await P365I_CRM.Common.Helpers.openCustomPage(primaryControl, customPage, navigationOptions);
                console.log(`Ribbon openCustomPage Result`, customPageResult);
            }
            Common.openCustomPage = openCustomPage;
        })(Common = Ribbon.Common || (Ribbon.Common = {}));
        let Prospect;
        (function (Prospect) {
            async function Qualify(primaryControl, customPageName) {
                console.log(`Function Qualify Triggered`);
                try {
                    console.log(`Qualify try`);
                    if (!primaryControl) {
                        console.log('Primary Control not present, abort');
                    }
                    const formContext = primaryControl;
                    if (P365I_CRM.Common.Helpers.formDirty(formContext)) {
                        return;
                    }
                    Common.openCustomPage(primaryControl, customPageName, "Qualify Prospect", 30, 40);
                }
                catch (error) {
                    console.log(`Qualify error`, error);
                    P365I_CRM.Common.Helpers.displayErrorMessage(error);
                }
                finally {
                    console.log(`Qualify finally`);
                }
            }
            Prospect.Qualify = Qualify;
            async function Disqualify(primaryControl) {
                console.log(`Function Disqualify Triggered`);
                try {
                    console.log(`Disqualify try`);
                    if (!primaryControl) {
                        console.log('Primary Control not present, abort');
                    }
                    const formContext = primaryControl;
                    if (P365I_CRM.Common.Helpers.formDirty(formContext)) {
                        return;
                    }
                    var recordId = P365I_CRM.Common.Helpers.cleanID(primaryControl.data.entity.getId());
                    var record = {};
                    record.statuscode = 2;
                    record.statecode = 1;
                    Xrm.WebApi.updateRecord("p365i_prospect", recordId, record).then(function success(result) {
                        primaryControl.data.refresh(false);
                    }, function (error) {
                        console.log(error.message);
                    });
                }
                catch (error) {
                    console.log(`Disqualify error`, error);
                    P365I_CRM.Common.Helpers.displayErrorMessage(error);
                }
                finally {
                    console.log(`Disqualify finally`);
                }
            }
            Prospect.Disqualify = Disqualify;
            function ValidateLeadQualified(primaryControl) {
                console.log('Function ValidateLeadQualified called');
                if (!primaryControl) {
                    console.log('Primary Control not present, abort');
                }
                const formContext = primaryControl;
                const statuscodeValue = P365I_CRM.Common.Helpers.getAttributeValue(formContext, "statuscode");
                if (statuscodeValue == P365I_CRM.Common.Enums.Prospect.StatusCode.Qualified)
                    return false;
                else
                    return true;
            }
            Prospect.ValidateLeadQualified = ValidateLeadQualified;
        })(Prospect = Ribbon.Prospect || (Ribbon.Prospect = {}));
        let Quote;
        (function (Quote) {
            async function CreateQuoteFromOpp(primaryControl) {
                console.log(`Function CreateQuoteFromOpp Triggered`);
                if (!primaryControl) {
                    console.log('Primary Control not present, abort');
                }
                const confirmStrings = { title: "Add Quote", text: "Are you sure you want to add a quote?" };
                let confirmAction = await P365I_CRM.Common.Helpers.confirmDialog(confirmStrings, undefined).catch((e) => console.log('Error:', e.message)) || new Object();
                if (confirmAction.confirmed !== true) {
                    return;
                }
                var recordId = P365I_CRM.Common.Helpers.cleanID(primaryControl.data.entity.getId());
                var execute_p365i_CreateQuotefromOpp_Request = {
                    entity: { entityType: "p365i_opportunity", id: recordId },
                    getMetadata: function () {
                        return {
                            boundParameter: "entity",
                            parameterTypes: {
                                entity: { typeName: "mscrm.p365i_opportunity", structuralProperty: 5 }
                            },
                            operationType: 0, operationName: "p365i_CreateQuotefromOpp"
                        };
                    }
                };
                Xrm.WebApi.execute(execute_p365i_CreateQuotefromOpp_Request).then(function success(response) {
                    if (response.ok) {
                        console.log("Success");
                    }
                }).catch(function (error) {
                    console.log(error.message);
                });
            }
            Quote.CreateQuoteFromOpp = CreateQuoteFromOpp;
        })(Quote = Ribbon.Quote || (Ribbon.Quote = {}));
        let OpportunityProduct;
        (function (OpportunityProduct) {
            async function DeleteOpportunityProduct(primaryControl) {
                console.log(`Function DeleteOpportunityProduct Triggered`);
                if (!primaryControl) {
                    console.log('Primary Control not present, abort');
                }
                const confirmStrings = { title: "Delete opportunity product", text: "Are you sure you want to delete the selected product?" };
                let confirmAction = await P365I_CRM.Common.Helpers.confirmDialog(confirmStrings, undefined).catch((e) => console.log('Error:', e.message)) || new Object();
                if (confirmAction.confirmed !== true) {
                    return;
                }
                var recordId = P365I_CRM.Common.Helpers.cleanID(primaryControl.data.entity.getId());
                var execute_p365i_CreateQuotefromOpp_Request = {
                    entity: { entityType: "p365i_opportunity", id: recordId },
                    getMetadata: function () {
                        return {
                            boundParameter: "entity",
                            parameterTypes: {
                                entity: { typeName: "mscrm.p365i_opportunity", structuralProperty: 5 }
                            },
                            operationType: 0, operationName: "p365i_CreateQuotefromOpp"
                        };
                    }
                };
                Xrm.WebApi.execute(execute_p365i_CreateQuotefromOpp_Request).then(function success(response) {
                    if (response.ok) {
                        console.log("Success");
                    }
                }).catch(function (error) {
                    console.log(error.message);
                });
            }
            OpportunityProduct.DeleteOpportunityProduct = DeleteOpportunityProduct;
        })(OpportunityProduct = Ribbon.OpportunityProduct || (Ribbon.OpportunityProduct = {}));
    })(Ribbon = P365I_CRM.Ribbon || (P365I_CRM.Ribbon = {}));
})(P365I_CRM || (P365I_CRM = {}));
console.log(`Ribbon Script Loaded...`);
//# sourceMappingURL=ribbon.js.map