﻿console.log(`Ribbon Script Loading...`);

namespace P365I_CRM.Ribbon {

    export namespace Common {

        export async function openCustomPage(primaryControl: Xrm.FormContext, customPageName: string, customPageTitle: string | undefined, width: number, height: number) {
            console.log(`Ribbon Function openCustomPage Triggered`);

            //Discussion to have the constructs in here or in the helper function. What if the primarycontrol and/or other input params are not provided? Not validated here, but in helper.

            const navigationOptions: Xrm.Navigation.NavigationOptions = {
                target: 2,
                position: 1,
                width: { value: width, unit: "%" },
                height: { value: height, unit: "%" },
                title: customPageTitle
            };

            const customPage: Xrm.Navigation.CustomPage = {
                pageType: "custom",
                name: customPageName,
                entityName: primaryControl.data.entity.getEntityName(),
                recordId: P365I_CRM.Common.Helpers.cleanID(primaryControl.data.entity.getId()),
            };

            const customPageResult: any = await P365I_CRM.Common.Helpers.openCustomPage(primaryControl, customPage, navigationOptions);

            console.log(`Ribbon openCustomPage Result`, customPageResult);
        }
    }

    export namespace Prospect {

        export async function Qualify(primaryControl: Xrm.FormContext, customPageName: string) {
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

                /*const confirmStrings: Xrm.Navigation.ConfirmStrings = { title: "Qualify Prospect", text: "Are you sure you would like to qualify this prospect?" };
                let confirmAction: Xrm.Navigation.ConfirmResult = await P365I_CRM.Common.Helpers.confirmDialog(confirmStrings, undefined).catch((e: any) => console.log('Error:', e.message)) || new Object() as Xrm.Navigation.ConfirmResult;
                if (confirmAction.confirmed !== true) {
                    return;
                }*/

                Common.openCustomPage(primaryControl, customPageName,"Qualify Prospect", 30, 40);
            }
            catch (error) {
                console.log(`Qualify error`, error);
                P365I_CRM.Common.Helpers.displayErrorMessage(error);
            }
            finally {
                console.log(`Qualify finally`);
            }
        }

        export async function Disqualify(primaryControl: Xrm.FormContext) {
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
                //@ts-ignore
                record.statuscode = 2; // Status
                //@ts-ignore
                record.statecode = 1; // State

                Xrm.WebApi.updateRecord("p365i_prospect", recordId, record).then(
                    function success(result) {
                        primaryControl.data.refresh(false);
                    },
                    function (error) {
                        console.log(error.message);
                    }
                );                
            }
            catch (error) {
                console.log(`Disqualify error`, error);
                P365I_CRM.Common.Helpers.displayErrorMessage(error);
            }
            finally {
                console.log(`Disqualify finally`);
            }
        }

        export function ValidateLeadQualified(primaryControl: Xrm.FormContext)
        {
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
    }

    export namespace Quote {

        export async function CreateQuoteFromOpp(primaryControl: Xrm.FormContext) {
            console.log(`Function CreateQuoteFromOpp Triggered`);

            if (!primaryControl) {
                console.log('Primary Control not present, abort');
            }

            const confirmStrings: Xrm.Navigation.ConfirmStrings = { title: "Add Quote", text: "Are you sure you want to add a quote?" };
            let confirmAction: Xrm.Navigation.ConfirmResult = await P365I_CRM.Common.Helpers.confirmDialog(confirmStrings, undefined).catch((e: any) => console.log('Error:', e.message)) || new Object() as Xrm.Navigation.ConfirmResult;
            if (confirmAction.confirmed !== true) {
                return;
            }

            var recordId = P365I_CRM.Common.Helpers.cleanID(primaryControl.data.entity.getId());

            var execute_p365i_CreateQuotefromOpp_Request = {
                // Parameters
                entity: { entityType: "p365i_opportunity", id: recordId }, // entity

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
            //@ts-ignore
            Xrm.WebApi.execute(execute_p365i_CreateQuotefromOpp_Request).then(
                function success(response: any) {
                    if (response.ok) { console.log("Success"); }
                }
            ).catch(function (error: any) {
                console.log(error.message);
            });
        }
    }

    export namespace OpportunityProduct {

        export async function DeleteOpportunityProduct(primaryControl: Xrm.FormContext) {
            console.log(`Function DeleteOpportunityProduct Triggered`);

            if (!primaryControl) {
                console.log('Primary Control not present, abort');
            }

            const confirmStrings: Xrm.Navigation.ConfirmStrings = { title: "Delete opportunity product", text: "Are you sure you want to delete the selected product?" };
            let confirmAction: Xrm.Navigation.ConfirmResult = await P365I_CRM.Common.Helpers.confirmDialog(confirmStrings, undefined).catch((e: any) => console.log('Error:', e.message)) || new Object() as Xrm.Navigation.ConfirmResult;
            if (confirmAction.confirmed !== true) {
                return;
            }

            var recordId = P365I_CRM.Common.Helpers.cleanID(primaryControl.data.entity.getId());

            var execute_p365i_CreateQuotefromOpp_Request = {
                // Parameters
                entity: { entityType: "p365i_opportunity", id: recordId }, // entity

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
            //@ts-ignore
            Xrm.WebApi.execute(execute_p365i_CreateQuotefromOpp_Request).then(
                function success(response: any) {
                    if (response.ok) { console.log("Success"); }
                }
            ).catch(function (error: any) {
                console.log(error.message);
            });
        }
    }
}

console.log(`Ribbon Script Loaded...`);