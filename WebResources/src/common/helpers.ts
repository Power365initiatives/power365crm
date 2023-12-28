console.log(`Helper Script Loading...`);

namespace P365I_CRM.Common.Helpers {

    export async function sleep(ms: number) {
        //Description: Sleep asynchronously for x milliseconds
        //Ussage: await sleep(2000);
        //Not best practice to use. Use awaits
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    export function capitalize(s: string | undefined) {
        if (typeof s !== 'string') return ''
        return s.charAt(0).toUpperCase() + s.slice(1)
    }

    export function tryGetValue<T>(formContext: Xrm.FormContext, attributeName: string) {
        return formContext.getAttribute<Xrm.Attributes.Attribute<T>>(attributeName)?.getValue();
    }

    export function trySetValue<T>(formContext: Xrm.FormContext, attributeName: string, value: any) {
        return formContext.getAttribute<Xrm.Attributes.Attribute<T>>(attributeName)?.setValue(value);
    }

    export function displayErrorMessage(error: any) {
        let errormessage: string = `Unknown error`;

        if (typeof error === 'object' && error.message) {
            errormessage = error.message;
        }
        else if (typeof error === 'string') {
            errormessage = error;
        }

        const alertStrings: Xrm.Navigation.AlertStrings = { confirmButtonLabel: `OK`, text: errormessage, title: `Something went wrong` };
        P365I_CRM.Common.Helpers.alertDialog(alertStrings, undefined, undefined, undefined);
    }

    export function formDirty(formContext: Xrm.FormContext) {
        let dirty = formContext.data.entity.getIsDirty();
        if (dirty) {
            const alertStrings = { confirmButtonLabel: "OK", text: "There are unsaved changes. Please save the form before proceeding.", title: "Warning" };
            alertDialog(alertStrings, undefined, undefined, undefined);
        }
        return dirty;
    }

    export function getAttributeValue(formContext: Xrm.FormContext, attributename: string): any {
        if (formContext.getAttribute(attributename) != null) {
            return formContext.getAttribute(attributename).getValue();
        }
        return null;
    }

    export function setAttributeValue(formContext: Xrm.FormContext, attributename: string, value: any, fireOnchange?: Boolean) {
        if (formContext == null || attributename == null) {
            console.log("ERROR common.setAttributeValue: invalid input.");
        }
        if (formContext.getAttribute(attributename) != null) {
            formContext.getAttribute(attributename).setValue(value);
        }
        if (fireOnchange === true) {
            formContext.getAttribute(attributename).fireOnChange();
        }
    }

    export function getBoolValue(formContext: Xrm.FormContext, attributeName: string) {
        if (!formContext || !attributeName) {
            console.log(`ERROR common.getBoolValue: formcontext and/or attributename missing`);
            return null;
        }
        if (existControl(formContext, attributeName)) {
            let attribute = formContext.getAttribute(attributeName);
            if (attribute) {
                return attribute.getValue();
            }
        } else { return null }
    }

    export function confirmDialog(confirmStrings: Xrm.Navigation.ConfirmStrings | undefined, confirmOptions: Xrm.Navigation.DialogSizeOptions | undefined) {
        return new Promise<Xrm.Navigation.ConfirmResult>(function (resolve, reject) {
            confirmStrings = confirmStrings ?? { cancelButtonLabel: "Cancel", confirmButtonLabel: "Ok", text: "This is a confirmation.", title: "Confirmation Dialog Title", subtitle: "Subtitle" };
            confirmOptions = confirmOptions ?? { height: 200, width: 450 };

            Xrm.Navigation.openConfirmDialog(confirmStrings, confirmOptions).then(
                function success(result) {
                    console.log("Confirm Dialog Success", result);
                    resolve(result);
                },
                function (error) {
                    console.log("Confirm Dialog Error", error);
                    reject(error);
                }
            );
        });
    }

    export function alertDialog(alertStrings: Xrm.Navigation.AlertStrings | undefined, alertOptions: Xrm.Navigation.DialogSizeOptions | undefined, succesCallback: Function | undefined, errorCallback: Function | undefined) {
        //Description: Global alertDialog. Styled
        //Ussage: 
        alertStrings = alertStrings ? alertStrings : { confirmButtonLabel: "Ok", text: "Confirmed", title: "Warning" };
        alertOptions = alertOptions ? alertOptions : { height: 200, width: 450 };

        Xrm.Navigation.openAlertDialog(alertStrings, alertOptions).then(
            function success(result) {
                if (succesCallback) {
                    succesCallback(result);
                }
                console.log("Alert dialog closed");
            },
            function (error) {
                if (errorCallback) {
                    errorCallback(error);
                }
            }
        );
    }

    export function addFunctionToOnchange(formContext: Xrm.FormContext, attributeOrCollection: any, functionName: Xrm.Events.ContextSensitiveHandler) {

        if (!attributeOrCollection || !functionName) {
            console.log("Missing Input to Add Function to Attribute");
            return;
        }

        let bindFunction = (attName: string) => {
            formContext.getAttribute(attName).controls.forEach(
                function (control) {
                    let attribute: Xrm.Attributes.Attribute = formContext.getAttribute(control.getName());
                    if (attribute) {
                        attribute.addOnChange(functionName);
                    }
                }
            );
        }

        attributeOrCollection = Array.isArray(attributeOrCollection) ? attributeOrCollection : new Array(attributeOrCollection);

        attributeOrCollection.forEach(function (value: string) {
            if (existControl(formContext, value) === true) {
                bindFunction(value);
            }
            else {
                console.log(`Control with ${value} not found. Unable to add ${functionName?.name}`);
            }
        })

    }

    export function existControl(formContext: Xrm.FormContext, attName: string) {
        return formContext.getControl(attName) ? true : false;
    }

    export function navigateTo(pageInput: Xrm.Navigation.PageInputEntityRecord, navigationOptions: Xrm.Navigation.NavigationOptions | undefined) {
        navigationOptions = navigationOptions ? navigationOptions : navigationOptions = {
            target: 2,
            height: { value: 80, unit: "%" },
            width: { value: 70, unit: "%" },
            position: 1
        };

        Xrm.Navigation.navigateTo(pageInput, navigationOptions);
    }

    export function retrieveSingle(entityName: string, recordId: string, queryData: string) {
        return new Promise(function (resolve, reject) {
            if (!entityName || !recordId || !queryData) {
                reject({ message: "Required input is missing to continue" });
            }
            else {
                if (recordId.startsWith("{")) {
                    recordId = cleanID(recordId);
                }
                Xrm.WebApi.online.retrieveRecord(entityName, recordId, queryData).then(
                    function success(result) {
                        resolve(result);
                    },
                    function (error) {
                        reject(error.message);
                    }
                );
            }
        });
    }

    export function retrieveMultiple(entityName: string, queryData: string) {
        return new Promise<Xrm.RetrieveMultipleResult>(function (resolve, reject) {
            if (!entityName || !queryData) {
                reject({ message: "Required input is missing to continue" });
            }
            else {
                Xrm.WebApi.online.retrieveMultipleRecords(entityName, queryData).then(
                    function success(results) {
                        resolve(results);
                    },
                    function (error) {
                        reject(error);
                    }
                );
            }
        });
    }

    export function getDatabyFetchXML(entityName: string, fetchXml: string) {
        return new Promise<Xrm.RetrieveMultipleResult>(function (resolve, reject) {
            if (entityName && fetchXml) {
                Xrm.WebApi.online.retrieveMultipleRecords(entityName, `?fetchXml=${fetchXml}`).then(
                    function success(results) {
                        resolve(results);
                    },
                    function (error) {
                        reject(error);
                    }
                );
            }
            else {
                reject(null);
            }
        });
    }

    export async function getEnvVariables(envDefName: string) {
        const fetchXml: string =
            `<fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="false">
              <entity name="environmentvariablevalue">
                <attribute name="environmentvariablevalueid" />
                <attribute name="value" />
                <link-entity name="environmentvariabledefinition" from="environmentvariabledefinitionid" to="environmentvariabledefinitionid" link-type="inner" alias="envvardef">
                  <filter type="and">
                    <condition attribute="schemaname" operator="eq" value="${envDefName}" />
                  </filter>
                </link-entity>
              </entity>
            </fetch>`;

        return await getDatabyFetchXML("environmentvariablevalue", fetchXml);
    }

    export function makeWebRequest(url: string, method: string, data: object) {
        return new Promise(function (resolve, reject) {
            if (!data || !url || !method) {
                console.log(`Cannot make WebRequest, required input is missing`);
                return;
            }

            var req = new XMLHttpRequest();
            req.open(method, url, true);
            req.setRequestHeader("OData-MaxVersion", "4.0");
            req.setRequestHeader("OData-Version", "4.0");
            req.setRequestHeader("Accept", "application/json");
            req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
            req.onreadystatechange = function () {
                if (this.readyState === 4) {
                    req.onreadystatechange = null;
                    resolve(this);
                }
            };
            req.send(JSON.stringify(data));
        });
    }

    export async function callFlow(primaryControl: Xrm.FormContext, envVarFlowurl: string, confirmStrings: Xrm.Navigation.ConfirmStrings) {

        console.log(`Function callFlow Triggered`);

        return new Promise(async function (resolve, reject) {
            try {
                console.log(`callFlow try`);

                //Check user input
                if (!primaryControl || !primaryControl.data) {
                    throw new Error(`PrimaryControl is not provided or incorrect`);
                }
                else if (!envVarFlowurl || typeof (envVarFlowurl) !== `string`) {
                    throw new Error(`Environment Variable not provided or not a string`);
                }

                //Validate the form if it's not dirty
                if (P365I_CRM.Common.Helpers.formDirty(primaryControl)) {
                    return;
                }

                const confirmAction: Xrm.Navigation.ConfirmResult = await P365I_CRM.Common.Helpers.confirmDialog(confirmStrings, undefined);

                //Validate user confirmation
                if (confirmAction.confirmed !== true) {
                    return;
                }

                Xrm.Utility.showProgressIndicator(`In Progress...`);

                //Get the flow url from the Environment Variable
                const flowUrlResultSet: Xrm.RetrieveMultipleResult = await P365I_CRM.Common.Helpers.getEnvVariables(envVarFlowurl);
                const flowUrl = flowUrlResultSet?.entities?.[0]?.value ?? null;

                if (flowUrl === null) {
                    throw new Error(`Unable to get the Flow url by using Environment Variable ${envVarFlowurl}`);
                }

                //Construct the payload
                const requestData: P365I_CRM.Common.Interface.genericFlow = {
                    entityLogicalName: primaryControl.data.entity.getEntityName(),
                    entityId: P365I_CRM.Common.Helpers.cleanID(primaryControl.data.entity.getId()),
                    initiatingUserId: P365I_CRM.Common.Helpers.cleanID(Xrm.Utility.getGlobalContext().userSettings.userId)
                }

                //Call Flow
                const flowResult: any = await P365I_CRM.Common.Helpers.makeWebRequest(flowUrl, "POST", requestData);
                const statusCode = flowResult?.status ?? 0;
                const responseMessage = flowResult && flowResult.response != "" ? JSON.parse(flowResult.response)?.error?.message : `Unknown Error`;

                if ([202, 204].includes(statusCode)) { //202 Accepted //204 No Content Default Response Power Automate when using Async
                    const alertStrings: Xrm.Navigation.AlertStrings = { confirmButtonLabel: `Close`, text: `Cloudlow called with success`, title: `Cloudflow result` };
                    P365I_CRM.Common.Helpers.alertDialog(alertStrings, undefined, undefined, undefined);
                }
                else if ([200].includes(statusCode)) { //Used in a sync way, refresh the form to see results
                    const alertStrings = { confirmButtonLabel: `Close`, text: `Cloudflow performed with Success`, title: `Cloudflow result` };
                    P365I_CRM.Common.Helpers.alertDialog(alertStrings, undefined, undefined, undefined);
                    primaryControl.data.refresh(true); //Refresh the form
                }
                else {
                    throw new Error(responseMessage)
                }
                resolve(flowResult);
            }
            catch (error: any) {
                console.log(`callFlow error`, error);
                P365I_CRM.Common.Helpers.displayErrorMessage(error);
                reject(error);
            }
            finally {
                console.log(`callFlow finally`);
                Xrm.Utility.closeProgressIndicator(); //Make sure the progress indicator is closed                         
            }
        });
    }

    export function cleanID(input: string) {
        return input.substring(0, 1) === "{" ? input.substring(1, 37) : input;
    }

    export function openSSRSReport(reportId: string, action: string, context: string, recordsype: number, recordIds: string, filename: string, openUrlOptions?: Xrm.Navigation.DialogSizeOptions) {
        console.log("openSSRSReport Triggered");
        const orgUrl = Xrm.Utility.getGlobalContext().getClientUrl();
        const reportUrl = `${orgUrl}/crmreports/viewer/viewer.aspx?id=${encodeURIComponent(reportId)}&action=${encodeURIComponent(action)}&context=${encodeURIComponent(context)}&recordstype=${recordsype}&records=${encodeURIComponent(recordIds)}&helpID=${encodeURIComponent(filename)}`;
        Xrm.Navigation.openUrl(reportUrl, openUrlOptions);
    }

    export function showHideSection(formContext: Xrm.FormContext, tabName: string, sectionName: string, show: boolean) {
        let tabObj = formContext.ui.tabs.get(tabName);
        let sectionObj = tabObj != null ? tabObj.sections.get(sectionName) : null;

        if (sectionObj != null) {
            sectionObj.setVisible(show);
        }
    }

    export function getLookupId(FORM_CONTEXT: Xrm.FormContext, attributename: string): string {
        if (FORM_CONTEXT.getAttribute(attributename) != null) {
            if (FORM_CONTEXT.getAttribute(attributename).getAttributeType() == "lookup") {
                let lookup = FORM_CONTEXT.getAttribute(attributename).getValue();
                if (lookup != null) return lookup[0].id;
            }
        }
        return "";
    }

    export function getLookupName(FORM_CONTEXT: Xrm.FormContext, attributename: string): string {
        if (FORM_CONTEXT.getAttribute(attributename) != null) {
            if (FORM_CONTEXT.getAttribute(attributename).getAttributeType() == "lookup") {
                let lookup = FORM_CONTEXT.getAttribute(attributename).getValue();
                if (lookup != null) return lookup[0].name;
            }
        }
        return "";
    }

    export function setLookupValue(FORM_CONTEXT: Xrm.FormContext, attributename: string, lookupname: string, lookupid: string, lookupentityname: string) {
        if (FORM_CONTEXT == null || attributename == null || lookupname == null || lookupid == null || lookupentityname == null) {
            console.log("ERROR common.setLookupValue: invalid input.");
        }
        if (existControl(FORM_CONTEXT, attributename)) {
            FORM_CONTEXT.getAttribute(attributename).setValue([{ id: lookupid, name: lookupname, entityType: lookupentityname }]);
        }
    }

    export function createLookup(id: string, name: string, entityType: string): P365I_CRM.Common.Interface.LookupEntity {
        if (!id || !name || !entityType) {
            console.log("Required input is missing to create lookup");
            return {} as P365I_CRM.Common.Interface.LookupEntity;
        }

        let lookupData = new Array();
        let LookupControlItem = new Object() as any;
        LookupControlItem.id = id;
        LookupControlItem.name = name;
        LookupControlItem.entityType = entityType;
        lookupData[0] = LookupControlItem;
        return lookupData;
    };

    export function getValueFromEntity(entity: any, key: string) {
        if (!entity || !key)
            return null;
        return entity[`${key}`] || entity[`${key}`] == false ? entity[`${key}`] : null;
    }

    export function createLookupFromEntity(entity: any, attributeName: string): Xrm.LookupValue[] | null {
        if (!entity || !attributeName || !entity[attributeName]) {
            console.log("Required input is missing to create lookup");
            return null;
        }

        return [{
            id: entity[attributeName],
            name: entity[`${attributeName}@OData.Community.Display.V1.FormattedValue`],
            entityType: entity[`${attributeName}@Microsoft.Dynamics.CRM.lookuplogicalname`]
        }];

    };

    export function controlAttributeOrCollection(formContext: Xrm.FormContext, AttributeorCollection: any, Command: string) {
        if (!AttributeorCollection || !Command) {
            console.log("Cannot ControlAttribute(s), Attribute(s) or Command missing.");
            return;
        }

        let Execute = function (AttributeName: string, Command: string) {
            var getAttribute: Xrm.Attributes.Attribute<any> = formContext.getAttribute(AttributeName);
            let uiAttribute: Xrm.Controls.StandardControl = formContext.getControl(AttributeName);

            if (getAttribute != null) {
                if (Command === "notrequired" && typeof getAttribute.setRequiredLevel == "function") {
                    getAttribute.setRequiredLevel("none");
                }
                else if (Command === "required" && typeof getAttribute.setRequiredLevel == "function") {
                    getAttribute.setRequiredLevel("required");
                }
                else if (Command === "recommended" && typeof getAttribute.setRequiredLevel == "function") {
                    getAttribute.setRequiredLevel("recommended");
                }
                else if (Command === "submitifdirty" && typeof getAttribute.getIsDirty == "function") {
                    if (getAttribute.getIsDirty()) {
                        getAttribute.setSubmitMode("always");
                    }
                }
                else if (Command === "never" && typeof getAttribute.getIsDirty == "function") {
                    getAttribute.setSubmitMode("never");
                }
                else if (Command === "blank") {
                    if (getAttribute.getValue() === null) { return; } //No need to blank when already empty
                    getAttribute.setValue(null);
                    uiAttribute.clearNotification(); //CRM Default gives an error when a required field is set to zero.
                }
                else if (Command === "settozero") {
                    if (getAttribute.getValue() == null) {
                        getAttribute.setValue(0);
                    }
                }
            }

            if (uiAttribute != null) {
                if (Command === "visible" && typeof uiAttribute.setVisible === "function") {
                    uiAttribute.setVisible(true);
                }
                else if (Command === "invisible" && typeof uiAttribute.setVisible === "function") {
                    uiAttribute.setVisible(false);
                }
                else if (Command === "setDisabled" && typeof uiAttribute.setDisabled === "function") {
                    uiAttribute.setDisabled(true);
                }
                else if (Command === "setEnabled" && typeof uiAttribute.setDisabled === "function") {
                    uiAttribute.setDisabled(false);
                }
            }
        };

        if (Array.isArray(AttributeorCollection)) {
            for (var i = 0; i < AttributeorCollection.length; i++) {
                if (existControl(formContext, AttributeorCollection[i])) {
                    formContext.getAttribute(AttributeorCollection[i]).controls.forEach(
                        //Attribute can be on form multiple times.
                        //If not using the foreach, only the first attribute on the form is controlled.
                        function (control) {
                            Execute(control.getName(), Command);
                        }
                    );
                }
            }
        }
        else if (AttributeorCollection === "*") {
            formContext.data.entity.attributes.forEach(
                function (attribute, index) {
                    //console.log(`Control Name ${attribute.getName()} and index ${index}`);
                    Execute(attribute.getName(), Command);
                }
            );
        }
        else if (existControl(formContext, AttributeorCollection)) {
            formContext.getAttribute(AttributeorCollection).controls.forEach(
                function (control) {
                    Execute(control.getName(), Command);
                }
            );
        }
    }

    export function callWorkflow(workflowId: String, recordId: String) {
        return new Promise<Xrm.ExecuteResponse>(function (resolve, reject) {
            var entity = {
                id: workflowId,
                entityType: "workflow"
            };

            var parameters = {
                entity: entity,
                EntityId: recordId
            };

            var executeWorkflowRequest = {
                entity: parameters.entity,
                EntityId: parameters.EntityId,

                getMetadata: function () {
                    return {
                        boundParameter: "entity",
                        parameterTypes: {
                            "entity": {
                                "typeName": "mscrm.workflow",
                                "structuralProperty": 5
                            },
                            "EntityId": {
                                "typeName": "Edm.String",
                                "structuralProperty": 1
                            }
                        },
                        operationType: 0,
                        operationName: "ExecuteWorkflow"
                    };
                }
            };

            Xrm.WebApi.online.execute(executeWorkflowRequest).then(
                function success(result) {
                    if (result.ok) {
                        resolve(result);
                    }
                },
                function (error) {
                    reject(error);
                }
            );
        });
    }

    /*export function setApprovalTaskCanceled(activityId: string) {
        return new Promise<any>(function (resolve, reject) {
            console.log(activityId)

            let data: P365I_CRM.Common.Interface.approvalTask = {
                statecode: P365I_CRM.Common.Enums.ApprovalTask.StateCode.Canceled,
                statuscode: P365I_CRM.Common.Enums.ApprovalTask.StatusCode.Canceled
            };

            Xrm.WebApi.online.updateRecord("be_approvaltask", activityId, data).then(
                function success(result) {
                    resolve(result);
                },
                function (error) {
                    reject(error);
                }
            );
        });
    }*/

    export function hasRole(roleName: string): boolean {
        let result = false;

        try {
            const userRoles = Xrm.Utility.getGlobalContext().userSettings.roles;
            userRoles.forEach(function (item) {
                if (item.name == roleName) {
                    result = true;
                }
            });
        }
        catch (error) {
            console.log(`Something went wrong`, error);
        }
        finally {
            return result;
        }
    }

    export function openCustomPage(primaryControl: Xrm.FormContext, customPage: Xrm.Navigation.CustomPage, navigationOptions: Xrm.Navigation.NavigationOptions | undefined) {

        console.log(`Function openCustomPage Triggered`);
        return new Promise(function (resolve, reject) {
            try {
                console.log(`openCustomPage try`);

                //Check user input
                if (!primaryControl || !primaryControl.data) {
                    throw new Error(`PrimaryControl is not provided or incorrect`);
                }
                else if (!customPage) {
                    throw new Error(`CustomPage object not provided or incorrect`);
                }

                //Validate the form if it's not dirty
                if (P365I_CRM.Common.Helpers.formDirty(primaryControl)) {
                    return;
                }

                const defaultnavigationOptions: Xrm.Navigation.NavigationOptions = {
                    target: 2,
                    position: 1,
                    width: { value: 40, unit: "%" },
                    height: { value: 40, unit: "%" }
                };

                navigationOptions = navigationOptions ?? defaultnavigationOptions;

                Xrm.Navigation.navigateTo(customPage, navigationOptions).then(
                    function (success) {
                        console.log('Closed', success);
                        Xrm.Page.data.refresh(false);
                        resolve(success);

                    }).catch(
                        function (error) {
                            console.log('Error', error);
                        }
                    );
            }
            catch (error: any) {
                console.log(`openCustomPage error`, error);
                P365I_CRM.Common.Helpers.displayErrorMessage(error);
                reject(error);
            }
            finally {
                console.log(`openCustomPage finally`);
            }
        });
    }

    export function openDialog(entityLogicalName: string, entityId: string | undefined, width: number, height: number, data: object | undefined) {
        console.log(`Function openDialog Triggered`);

        var pageInput: Xrm.Navigation.PageInputEntityRecord = {
            pageType: "entityrecord",
            entityName: entityLogicalName,
            entityId: entityId,
            data: data
        };

        var navigationOptions: Xrm.Navigation.NavigationOptions = {
            target: 2,
            position: 1,
            width: { value: width, unit: "%" },
            height: { value: height, unit: "%" },
        };

        Xrm.Navigation.navigateTo(pageInput, navigationOptions).then(
            function () {
                console.log('Closed');
                Xrm.Page.data.refresh(false);
            }).catch(
                function (error) {
                    console.log('Error', error);
                }
            );
    }
}

console.log(`Helper Script Loaded...`);