"use strict";
console.log(`Helper Script Loading...`);
var P365I_CRM;
(function (P365I_CRM) {
    var Common;
    (function (Common) {
        var Helpers;
        (function (Helpers) {
            async function sleep(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }
            Helpers.sleep = sleep;
            function capitalize(s) {
                if (typeof s !== 'string')
                    return '';
                return s.charAt(0).toUpperCase() + s.slice(1);
            }
            Helpers.capitalize = capitalize;
            function tryGetValue(formContext, attributeName) {
                var _a;
                return (_a = formContext.getAttribute(attributeName)) === null || _a === void 0 ? void 0 : _a.getValue();
            }
            Helpers.tryGetValue = tryGetValue;
            function trySetValue(formContext, attributeName, value) {
                var _a;
                return (_a = formContext.getAttribute(attributeName)) === null || _a === void 0 ? void 0 : _a.setValue(value);
            }
            Helpers.trySetValue = trySetValue;
            function displayErrorMessage(error) {
                let errormessage = `Unknown error`;
                if (typeof error === 'object' && error.message) {
                    errormessage = error.message;
                }
                else if (typeof error === 'string') {
                    errormessage = error;
                }
                const alertStrings = { confirmButtonLabel: `OK`, text: errormessage, title: `Something went wrong` };
                P365I_CRM.Common.Helpers.alertDialog(alertStrings, undefined, undefined, undefined);
            }
            Helpers.displayErrorMessage = displayErrorMessage;
            function formDirty(formContext) {
                let dirty = formContext.data.entity.getIsDirty();
                if (dirty) {
                    const alertStrings = { confirmButtonLabel: "OK", text: "There are unsaved changes. Please save the form before proceeding.", title: "Warning" };
                    alertDialog(alertStrings, undefined, undefined, undefined);
                }
                return dirty;
            }
            Helpers.formDirty = formDirty;
            function getAttributeValue(formContext, attributename) {
                if (formContext.getAttribute(attributename) != null) {
                    return formContext.getAttribute(attributename).getValue();
                }
                return null;
            }
            Helpers.getAttributeValue = getAttributeValue;
            function setAttributeValue(formContext, attributename, value, fireOnchange) {
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
            Helpers.setAttributeValue = setAttributeValue;
            function getBoolValue(formContext, attributeName) {
                if (!formContext || !attributeName) {
                    console.log(`ERROR common.getBoolValue: formcontext and/or attributename missing`);
                    return null;
                }
                if (existControl(formContext, attributeName)) {
                    let attribute = formContext.getAttribute(attributeName);
                    if (attribute) {
                        return attribute.getValue();
                    }
                }
                else {
                    return null;
                }
            }
            Helpers.getBoolValue = getBoolValue;
            function confirmDialog(confirmStrings, confirmOptions) {
                return new Promise(function (resolve, reject) {
                    confirmStrings = confirmStrings !== null && confirmStrings !== void 0 ? confirmStrings : { cancelButtonLabel: "Cancel", confirmButtonLabel: "Ok", text: "This is a confirmation.", title: "Confirmation Dialog Title", subtitle: "Subtitle" };
                    confirmOptions = confirmOptions !== null && confirmOptions !== void 0 ? confirmOptions : { height: 200, width: 450 };
                    Xrm.Navigation.openConfirmDialog(confirmStrings, confirmOptions).then(function success(result) {
                        console.log("Confirm Dialog Success", result);
                        resolve(result);
                    }, function (error) {
                        console.log("Confirm Dialog Error", error);
                        reject(error);
                    });
                });
            }
            Helpers.confirmDialog = confirmDialog;
            function alertDialog(alertStrings, alertOptions, succesCallback, errorCallback) {
                alertStrings = alertStrings !== null && alertStrings !== void 0 ? alertStrings : { confirmButtonLabel: "Ok", text: "Confirmed", title: "Warning" };
                alertOptions = alertOptions !== null && alertOptions !== void 0 ? alertOptions : { height: 200, width: 450 };
                Xrm.Navigation.openAlertDialog(alertStrings, alertOptions).then(function success(result) {
                    if (succesCallback) {
                        succesCallback(result);
                    }
                    console.log("Alert dialog closed");
                }, function (error) {
                    if (errorCallback) {
                        errorCallback(error);
                    }
                });
            }
            Helpers.alertDialog = alertDialog;
            function addFunctionToOnchange(formContext, attributeOrCollection, functionName) {
                if (!attributeOrCollection || !functionName) {
                    console.log("Missing Input to Add Function to Attribute");
                    return;
                }
                let bindFunction = (attName) => {
                    formContext.getAttribute(attName).controls.forEach(function (control) {
                        let attribute = formContext.getAttribute(control.getName());
                        if (attribute) {
                            attribute.addOnChange(functionName);
                        }
                    });
                };
                attributeOrCollection = Array.isArray(attributeOrCollection) ? attributeOrCollection : new Array(attributeOrCollection);
                attributeOrCollection.forEach(function (value) {
                    if (existControl(formContext, value) === true) {
                        bindFunction(value);
                    }
                    else {
                        console.log(`Control with ${value} not found. Unable to add ${functionName === null || functionName === void 0 ? void 0 : functionName.name}`);
                    }
                });
            }
            Helpers.addFunctionToOnchange = addFunctionToOnchange;
            function existControl(formContext, attName) {
                return formContext.getControl(attName) ? true : false;
            }
            Helpers.existControl = existControl;
            function navigateTo(pageInput, navigationOptions) {
                navigationOptions = navigationOptions ? navigationOptions : navigationOptions = {
                    target: 2,
                    height: { value: 80, unit: "%" },
                    width: { value: 70, unit: "%" },
                    position: 1
                };
                Xrm.Navigation.navigateTo(pageInput, navigationOptions);
            }
            Helpers.navigateTo = navigateTo;
            function retrieveSingle(entityName, recordId, queryData) {
                return new Promise(function (resolve, reject) {
                    if (!entityName || !recordId || !queryData) {
                        reject({ message: "Required input is missing to continue" });
                    }
                    else {
                        if (recordId.startsWith("{")) {
                            recordId = cleanID(recordId);
                        }
                        Xrm.WebApi.online.retrieveRecord(entityName, recordId, queryData).then(function success(result) {
                            resolve(result);
                        }, function (error) {
                            reject(error.message);
                        });
                    }
                });
            }
            Helpers.retrieveSingle = retrieveSingle;
            function retrieveMultiple(entityName, queryData) {
                return new Promise(function (resolve, reject) {
                    if (!entityName || !queryData) {
                        reject({ message: "Required input is missing to continue" });
                    }
                    else {
                        Xrm.WebApi.online.retrieveMultipleRecords(entityName, queryData).then(function success(results) {
                            resolve(results);
                        }, function (error) {
                            reject(error);
                        });
                    }
                });
            }
            Helpers.retrieveMultiple = retrieveMultiple;
            function getDatabyFetchXML(entityName, fetchXml) {
                return new Promise(function (resolve, reject) {
                    if (entityName && fetchXml) {
                        Xrm.WebApi.online.retrieveMultipleRecords(entityName, `?fetchXml=${fetchXml}`).then(function success(results) {
                            resolve(results);
                        }, function (error) {
                            reject(error);
                        });
                    }
                    else {
                        reject(null);
                    }
                });
            }
            Helpers.getDatabyFetchXML = getDatabyFetchXML;
            async function getEnvVariables(envDefName) {
                const fetchXml = `<fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="false">
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
            Helpers.getEnvVariables = getEnvVariables;
            function makeWebRequest(url, method, data) {
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
            Helpers.makeWebRequest = makeWebRequest;
            async function callFlow(primaryControl, envVarFlowurl, confirmStrings) {
                console.log(`Function callFlow Triggered`);
                return new Promise(async function (resolve, reject) {
                    var _a, _b, _c, _d, _e, _f;
                    try {
                        console.log(`callFlow try`);
                        if (!primaryControl || !primaryControl.data) {
                            throw new Error(`PrimaryControl is not provided or incorrect`);
                        }
                        else if (!envVarFlowurl || typeof (envVarFlowurl) !== `string`) {
                            throw new Error(`Environment Variable not provided or not a string`);
                        }
                        if (P365I_CRM.Common.Helpers.formDirty(primaryControl)) {
                            return;
                        }
                        const confirmAction = await P365I_CRM.Common.Helpers.confirmDialog(confirmStrings, undefined);
                        if (confirmAction.confirmed !== true) {
                            return;
                        }
                        Xrm.Utility.showProgressIndicator(`In Progress...`);
                        const flowUrlResultSet = await P365I_CRM.Common.Helpers.getEnvVariables(envVarFlowurl);
                        const flowUrl = (_c = (_b = (_a = flowUrlResultSet === null || flowUrlResultSet === void 0 ? void 0 : flowUrlResultSet.entities) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.value) !== null && _c !== void 0 ? _c : null;
                        if (flowUrl === null) {
                            throw new Error(`Unable to get the Flow url by using Environment Variable ${envVarFlowurl}`);
                        }
                        const requestData = {
                            entityLogicalName: primaryControl.data.entity.getEntityName(),
                            entityId: P365I_CRM.Common.Helpers.cleanID(primaryControl.data.entity.getId()),
                            initiatingUserId: P365I_CRM.Common.Helpers.cleanID(Xrm.Utility.getGlobalContext().userSettings.userId)
                        };
                        const flowResult = await P365I_CRM.Common.Helpers.makeWebRequest(flowUrl, "POST", requestData);
                        const statusCode = (_d = flowResult === null || flowResult === void 0 ? void 0 : flowResult.status) !== null && _d !== void 0 ? _d : 0;
                        const responseMessage = flowResult && flowResult.response != "" ? (_f = (_e = JSON.parse(flowResult.response)) === null || _e === void 0 ? void 0 : _e.error) === null || _f === void 0 ? void 0 : _f.message : `Unknown Error`;
                        if ([202, 204].includes(statusCode)) {
                            const alertStrings = { confirmButtonLabel: `Close`, text: `Cloudlow called with success`, title: `Cloudflow result` };
                            P365I_CRM.Common.Helpers.alertDialog(alertStrings, undefined, undefined, undefined);
                        }
                        else if ([200].includes(statusCode)) {
                            const alertStrings = { confirmButtonLabel: `Close`, text: `Cloudflow performed with Success`, title: `Cloudflow result` };
                            P365I_CRM.Common.Helpers.alertDialog(alertStrings, undefined, undefined, undefined);
                            primaryControl.data.refresh(true);
                        }
                        else {
                            throw new Error(responseMessage);
                        }
                        resolve(flowResult);
                    }
                    catch (error) {
                        console.log(`callFlow error`, error);
                        P365I_CRM.Common.Helpers.displayErrorMessage(error);
                        reject(error);
                    }
                    finally {
                        console.log(`callFlow finally`);
                        Xrm.Utility.closeProgressIndicator();
                    }
                });
            }
            Helpers.callFlow = callFlow;
            function cleanID(input) {
                return input.substring(0, 1) === "{" ? input.substring(1, 37) : input;
            }
            Helpers.cleanID = cleanID;
            function openSSRSReport(reportId, action, context, recordsype, recordIds, filename, openUrlOptions) {
                console.log("openSSRSReport Triggered");
                const orgUrl = Xrm.Utility.getGlobalContext().getClientUrl();
                const reportUrl = `${orgUrl}/crmreports/viewer/viewer.aspx?id=${encodeURIComponent(reportId)}&action=${encodeURIComponent(action)}&context=${encodeURIComponent(context)}&recordstype=${recordsype}&records=${encodeURIComponent(recordIds)}&helpID=${encodeURIComponent(filename)}`;
                Xrm.Navigation.openUrl(reportUrl, openUrlOptions);
            }
            Helpers.openSSRSReport = openSSRSReport;
            function showHideSection(formContext, tabName, sectionName, show) {
                let tabObj = formContext.ui.tabs.get(tabName);
                let sectionObj = tabObj != null ? tabObj.sections.get(sectionName) : null;
                if (sectionObj != null) {
                    sectionObj.setVisible(show);
                }
            }
            Helpers.showHideSection = showHideSection;
            function getLookupId(FORM_CONTEXT, attributename) {
                if (FORM_CONTEXT.getAttribute(attributename) != null) {
                    if (FORM_CONTEXT.getAttribute(attributename).getAttributeType() == "lookup") {
                        let lookup = FORM_CONTEXT.getAttribute(attributename).getValue();
                        if (lookup != null)
                            return lookup[0].id;
                    }
                }
                return "";
            }
            Helpers.getLookupId = getLookupId;
            function getLookupName(FORM_CONTEXT, attributename) {
                if (FORM_CONTEXT.getAttribute(attributename) != null) {
                    if (FORM_CONTEXT.getAttribute(attributename).getAttributeType() == "lookup") {
                        let lookup = FORM_CONTEXT.getAttribute(attributename).getValue();
                        if (lookup != null)
                            return lookup[0].name;
                    }
                }
                return "";
            }
            Helpers.getLookupName = getLookupName;
            function setLookupValue(FORM_CONTEXT, attributename, lookupname, lookupid, lookupentityname) {
                if (FORM_CONTEXT == null || attributename == null || lookupname == null || lookupid == null || lookupentityname == null) {
                    console.log("ERROR common.setLookupValue: invalid input.");
                }
                if (existControl(FORM_CONTEXT, attributename)) {
                    FORM_CONTEXT.getAttribute(attributename).setValue([{ id: lookupid, name: lookupname, entityType: lookupentityname }]);
                }
            }
            Helpers.setLookupValue = setLookupValue;
            function createLookup(id, name, entityType) {
                if (!id || !name || !entityType) {
                    console.log("Required input is missing to create lookup");
                    return {};
                }
                let lookupData = new Array();
                let LookupControlItem = new Object();
                LookupControlItem.id = id;
                LookupControlItem.name = name;
                LookupControlItem.entityType = entityType;
                lookupData[0] = LookupControlItem;
                return lookupData;
            }
            Helpers.createLookup = createLookup;
            ;
            function getValueFromEntity(entity, key) {
                if (!entity || !key)
                    return null;
                return entity[`${key}`] || entity[`${key}`] == false ? entity[`${key}`] : null;
            }
            Helpers.getValueFromEntity = getValueFromEntity;
            function createLookupFromEntity(entity, attributeName) {
                if (!entity || !attributeName || !entity[attributeName]) {
                    console.log("Required input is missing to create lookup");
                    return null;
                }
                return [{
                        id: entity[attributeName],
                        name: entity[`${attributeName}@OData.Community.Display.V1.FormattedValue`],
                        entityType: entity[`${attributeName}@Microsoft.Dynamics.CRM.lookuplogicalname`]
                    }];
            }
            Helpers.createLookupFromEntity = createLookupFromEntity;
            ;
            function controlAttributeOrCollection(formContext, AttributeorCollection, Command) {
                if (!AttributeorCollection || !Command) {
                    console.log("Cannot ControlAttribute(s), Attribute(s) or Command missing.");
                    return;
                }
                let Execute = function (AttributeName, Command) {
                    var getAttribute = formContext.getAttribute(AttributeName);
                    let uiAttribute = formContext.getControl(AttributeName);
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
                            if (getAttribute.getValue() === null) {
                                return;
                            }
                            getAttribute.setValue(null);
                            uiAttribute.clearNotification();
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
                            formContext.getAttribute(AttributeorCollection[i]).controls.forEach(function (control) {
                                Execute(control.getName(), Command);
                            });
                        }
                    }
                }
                else if (AttributeorCollection === "*") {
                    formContext.data.entity.attributes.forEach(function (attribute, index) {
                        Execute(attribute.getName(), Command);
                    });
                }
                else if (existControl(formContext, AttributeorCollection)) {
                    formContext.getAttribute(AttributeorCollection).controls.forEach(function (control) {
                        Execute(control.getName(), Command);
                    });
                }
            }
            Helpers.controlAttributeOrCollection = controlAttributeOrCollection;
            function callWorkflow(workflowId, recordId) {
                return new Promise(function (resolve, reject) {
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
                    Xrm.WebApi.online.execute(executeWorkflowRequest).then(function success(result) {
                        if (result.ok) {
                            resolve(result);
                        }
                    }, function (error) {
                        reject(error);
                    });
                });
            }
            Helpers.callWorkflow = callWorkflow;
            function hasRole(roleName) {
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
            Helpers.hasRole = hasRole;
            function openCustomPage(primaryControl, customPage, navigationOptions) {
                console.log(`Function openCustomPage Triggered`);
                return new Promise(function (resolve, reject) {
                    try {
                        console.log(`openCustomPage try`);
                        if (!primaryControl || !primaryControl.data) {
                            throw new Error(`PrimaryControl is not provided or incorrect`);
                        }
                        else if (!customPage) {
                            throw new Error(`CustomPage object not provided or incorrect`);
                        }
                        if (P365I_CRM.Common.Helpers.formDirty(primaryControl)) {
                            return;
                        }
                        const defaultnavigationOptions = {
                            target: 2,
                            position: 1,
                            width: { value: 40, unit: "%" },
                            height: { value: 40, unit: "%" }
                        };
                        navigationOptions = navigationOptions !== null && navigationOptions !== void 0 ? navigationOptions : defaultnavigationOptions;
                        Xrm.Navigation.navigateTo(customPage, navigationOptions).then(function (success) {
                            console.log('Closed', success);
                            primaryControl.data.refresh(false);
                            resolve(success);
                        }).catch(function (error) {
                            console.log('Error', error);
                        });
                    }
                    catch (error) {
                        console.log(`openCustomPage error`, error);
                        P365I_CRM.Common.Helpers.displayErrorMessage(error);
                        reject(error);
                    }
                    finally {
                        console.log(`openCustomPage finally`);
                    }
                });
            }
            Helpers.openCustomPage = openCustomPage;
            function openDialog(entityLogicalName, entityId, width, height, data) {
                console.log(`Function openDialog Triggered`);
                var pageInput = {
                    pageType: "entityrecord",
                    entityName: entityLogicalName,
                    entityId: entityId,
                    data: data
                };
                var navigationOptions = {
                    target: 2,
                    position: 1,
                    width: { value: width, unit: "%" },
                    height: { value: height, unit: "%" },
                };
                Xrm.Navigation.navigateTo(pageInput, navigationOptions).then(function () {
                    console.log('Closed');
                }).catch(function (error) {
                    console.log('Error', error);
                });
            }
            Helpers.openDialog = openDialog;
        })(Helpers = Common.Helpers || (Common.Helpers = {}));
    })(Common = P365I_CRM.Common || (P365I_CRM.Common = {}));
})(P365I_CRM || (P365I_CRM = {}));
console.log(`Helper Script Loaded...`);
//# sourceMappingURL=helpers.js.map