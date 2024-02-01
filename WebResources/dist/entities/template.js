"use strict";
var Account;
(function (Account) {
    function onFormLoad(executionContext) {
        const formcontext = executionContext.getFormContext();
        formcontext.data.entity.addOnSave(function () { onFormSave(executionContext); });
        addOnchangeFunctionsToAttributes(executionContext);
        basicFunction(executionContext);
    }
    Account.onFormLoad = onFormLoad;
    function onFormSave(executionContext) {
    }
    Account.onFormSave = onFormSave;
    function addOnchangeFunctionsToAttributes(executionContext) {
        const formcontext = executionContext.getFormContext();
        let attribute = formcontext.getAttribute("address1_street1");
        if (attribute) {
            attribute.addOnChange(function () { basicFunction(executionContext); });
        }
    }
    Account.addOnchangeFunctionsToAttributes = addOnchangeFunctionsToAttributes;
    async function basicFunction(executionContext) {
        const formcontext = executionContext.getFormContext();
        const exampleLookup = formcontext.getAttribute('primarycontactid');
        const exampleString = formcontext.getAttribute('websiteurl').getValue();
        const exampleDateTime = formcontext.getAttribute('column_schema_name').getValue();
        const exampleOptionset = formcontext.getAttribute('industrycode').getValue();
        const numberOfEmpAtt = formcontext.getAttribute('numberofemployees');
        const recordId = formcontext.data.entity.getId();
        const accountData = await Xrm.WebApi.retrieveRecord('account', recordId, '?$select=name,_primarycontactid_value');
        const contactId = accountData['_primarycontactid_value'];
        const contactName = accountData['_primarycontactid_value@OData.Community.Display.V1.FormattedValue'];
        const lookupData = [{ id: contactId, entityType: "contact", name: contactName }];
        formcontext.getAttribute('primarycontactid').setValue(lookupData);
        let getAttribute = formcontext.getAttribute('websiteurl');
        getAttribute.setRequiredLevel("required");
        let uiAttribute = formcontext.getControl('industrycode');
        uiAttribute.setVisible(false);
    }
    Account.basicFunction = basicFunction;
    async function OpenCustomPage(primaryControl, customPageName) {
        const recordId = primaryControl.data.entity.getId().replace("{", "").replace("}", "");
        return new Promise(function (resolve, reject) {
            const navigationOptions = {
                target: 2,
                position: 1,
                width: { value: 50, unit: "%" },
                height: { value: 50, unit: "%" },
                title: "Custom Page title you want to show to the user"
            };
            const customPage = {
                pageType: "custom",
                name: customPageName,
                entityName: primaryControl.data.entity.getEntityName(),
                recordId: recordId,
            };
            Xrm.Navigation.navigateTo(customPage, navigationOptions).then(function (success) {
                primaryControl.data.refresh(false);
                resolve(success);
            }).catch(function (error) {
                console.log('Error: ', error);
            });
        });
    }
    Account.OpenCustomPage = OpenCustomPage;
    async function CallCustomAPI(primaryControl) {
        const recordId = primaryControl.data.entity.getId().replace("{", "").replace("}", "");
        Xrm.Utility.showProgressIndicator("processing...");
        return new Promise(function (resolve, reject) {
            const execute_name_of_your_custom_apip_Request = {
                Name_of_your_input_parameter: recordId,
                getMetadata: function () {
                    return {
                        boundParameter: null,
                        parameterTypes: {
                            Name_of_your_input_parameter: { typeName: "Edm.String", structuralProperty: 1 }
                        },
                        operationType: 0, operationName: "name_of_your_custom_api"
                    };
                }
            };
            Xrm.WebApi.online.execute(execute_name_of_your_custom_apip_Request).then(function success(response) {
                if (response.ok) {
                    response.json().then(function (results) {
                        const OutputParameter1 = results["OutputParameter1"];
                        const OutputParameter2 = results["OutputParameter2"];
                        const OutputParameter3 = results["OutputParameter3"];
                    });
                    resolve(response);
                }
            }).then(function (responseBody) {
                Xrm.Utility.closeProgressIndicator();
            }).catch(function (error) {
                console.log('Error: ', error);
                Xrm.Utility.closeProgressIndicator();
                reject(error);
            });
        });
    }
    Account.CallCustomAPI = CallCustomAPI;
    async function callFlow(primaryControl, flowurl) {
        const recordId = primaryControl.data.entity.getId().replace("{", "").replace("}", "");
        const userId = Xrm.Utility.getGlobalContext().userSettings.userId.replace("{", "").replace("}", "");
        Xrm.Utility.showProgressIndicator(`In Progress...`);
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        const raw = JSON.stringify({
            "topcount": 10,
            "skipcount": 1,
            "recordId": recordId,
            "userId": userId
        });
        const requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };
        return new Promise(async function (resolve, reject) {
            fetch(flowurl, requestOptions)
                .then(response => response.text())
                .then(result => function () {
                console.log(result);
                Xrm.Utility.closeProgressIndicator();
                resolve(result);
            })
                .catch(error => function () {
                console.log('error', error);
                Xrm.Utility.closeProgressIndicator();
                reject(error);
            });
        });
    }
    Account.callFlow = callFlow;
})(Account || (Account = {}));
//# sourceMappingURL=template.js.map