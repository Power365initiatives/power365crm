namespace P365I_CRM.Entities.Quote {
    let FORM_CONTEXT: Xrm.FormContext;
    let GLOBAL_CONTEXT: Xrm.GlobalContext;
    let FORM_ID: string;
    let FORM_TYPE: XrmEnum.FormType;
    let LEXICON: typeof P365I_CRM.Common.Enums;
    let HELPERS: typeof P365I_CRM.Common.Helpers;
    let REFRESHCOUNT: number = 0;

    export function onFormLoad(executionContext: Xrm.Events.EventContext) {
        console.log('OnFormLoad Triggered');

        FORM_CONTEXT = executionContext.getFormContext();
        GLOBAL_CONTEXT = Xrm.Utility.getGlobalContext();
        FORM_ID = FORM_CONTEXT.ui.formSelector.getCurrentItem() ? FORM_CONTEXT.ui.formSelector.getCurrentItem().getId().toUpperCase() : "";
        FORM_TYPE = FORM_CONTEXT.ui.getFormType();
        LEXICON = P365I_CRM.Common.Enums;
        HELPERS = P365I_CRM.Common.Helpers;

        FORM_CONTEXT.data.entity.addOnSave(function () { onFormSave(executionContext); });
        FORM_CONTEXT.data.entity.addOnPostSave(function () { onFormPostSave(executionContext); })
        addOnchangeFunctionsToAttributes();

        //@ts-ignore
        FORM_CONTEXT.getControl("Subgrid_products").addOnLoad(subgridOnLoad);  

    }

    export function onFormSave(executionContext: Xrm.Events.EventContext) {
        console.log(`onFormSave Triggered`);
    }

    export async function onFormPostSave(executionContext: Xrm.Events.EventContext) {
        console.log(`onFormPostSave Triggered`);
    }

    export function addOnchangeFunctionsToAttributes() {
        console.log(`addOnchangeFunctionsToAttributes Triggered`);        
    }

    export function subgridOnLoad() {
        console.log(`subgridOnLoad Triggered`);
        

        //@ts-ignore
        let subgridTotalRecordCount = FORM_CONTEXT.getControl("Subgrid_products").getGrid().getTotalRecordCount();
        if (REFRESHCOUNT == 0 && subgridTotalRecordCount == -1) {            
        }
        else if (REFRESHCOUNT == 0 && subgridTotalRecordCount > 0) {
            REFRESHCOUNT = REFRESHCOUNT + 1;
            FORM_CONTEXT.data.refresh(false);
        }
        else if (REFRESHCOUNT == 1 && subgridTotalRecordCount > 0) {
            REFRESHCOUNT = 0;
        }
        else if (REFRESHCOUNT > 0 && subgridTotalRecordCount == -1) {
            REFRESHCOUNT = 0;
            FORM_CONTEXT.data.refresh(false);
        }
    }
}