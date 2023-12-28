"use strict";
console.log(`Ribbon Script Loading...`);
var DP365I_CRM;
(function (DP365I_CRM) {
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
            async function Qualify(primaryControl) {
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
                    const confirmStrings = { title: "Qualify Prospect", text: "Are you sure you would like to qualify this prospect?" };
                    let confirmAction = await P365I_CRM.Common.Helpers.confirmDialog(confirmStrings, undefined).catch((e) => console.log('Error:', e.message)) || new Object();
                    if (confirmAction.confirmed !== true) {
                        return;
                    }
                    Common.openCustomPage(primaryControl, "p365i_qualifylead_c2d72", "Qualify Prospect", 30, 50);
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
    })(Ribbon = DP365I_CRM.Ribbon || (DP365I_CRM.Ribbon = {}));
})(DP365I_CRM || (DP365I_CRM = {}));
console.log(`Ribbon Script Loaded...`);
//# sourceMappingURL=ribbon.js.map