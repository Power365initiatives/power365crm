console.log(`Ribbon Script Loading...`);

namespace DP365I_CRM.Ribbon {

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

        export async function Qualify(primaryControl: Xrm.FormContext) {
            console.log(`Function Account buttonClick Triggered`);

            try {
                console.log(`Qualify try`);

                if (!primaryControl) {
                    console.log('Primary Control not present, abort');
                }
                const formContext = primaryControl;
                if (P365I_CRM.Common.Helpers.formDirty(formContext)) {
                    return;
                }

                const confirmStrings: Xrm.Navigation.ConfirmStrings = { title: "Qualify Prospect", text: "Are you sure you would like to qualify this prospect?" };
                let confirmAction: Xrm.Navigation.ConfirmResult = await P365I_CRM.Common.Helpers.confirmDialog(confirmStrings, undefined).catch((e: any) => console.log('Error:', e.message)) || new Object() as Xrm.Navigation.ConfirmResult;
                if (confirmAction.confirmed !== true) {
                    return;
                }

                Common.openCustomPage(primaryControl,"p365i_qualifylead_c2d72","Qualify Prospect", 30, 50);
            }
            catch (error) {
                console.log(`Qualify error`, error);
                P365I_CRM.Common.Helpers.displayErrorMessage(error);
            }
            finally {
                console.log(`Qualify finally`);
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
}

console.log(`Ribbon Script Loaded...`);