namespace Account
{
    export function onFormLoad(executionContext: Xrm.Events.EventContext): void
    {
        const formcontext = executionContext.getFormContext();
        formcontext.data.entity.addOnSave(function () { onFormSave(executionContext); });
        addOnchangeFunctionsToAttributes(executionContext);
        basicFunction(executionContext);
    }

    export function onFormSave(executionContext: Xrm.Events.EventContext): void
    {        
    }

    export function addOnchangeFunctionsToAttributes(executionContext: Xrm.Events.EventContext): void
    {        
        const formcontext = executionContext.getFormContext();
        let attribute: Xrm.Attributes.Attribute = formcontext.getAttribute("address1_street1");
        if (attribute)
        {
            attribute.addOnChange(function () { basicFunction(executionContext); });
        }
    }

    export async function basicFunction(executionContext: Xrm.Events.EventContext): Promise<void>
    {
        const formcontext = executionContext.getFormContext();

        //retrieve values from the form
        const exampleLookup: Xrm.Attributes.LookupAttribute = formcontext.getAttribute<Xrm.Attributes.LookupAttribute>('primarycontactid');
        const exampleString = formcontext.getAttribute<Xrm.Attributes.StringAttribute>('websiteurl').getValue();
        const exampleDateTime = formcontext.getAttribute<Xrm.Attributes.DateAttribute>('column_schema_name').getValue();
        const exampleOptionset = formcontext.getAttribute<Xrm.Attributes.OptionSetAttribute>('industrycode').getValue();
        const numberOfEmpAtt = formcontext.getAttribute<Xrm.Attributes.NumberAttribute>('numberofemployees');

        //set a lookup in the form
        const recordId: string = formcontext.data.entity.getId();
        const accountData = await Xrm.WebApi.retrieveRecord('account', recordId, '?$select=name,_primarycontactid_value');
        const contactId = accountData['_primarycontactid_value'];
        const contactName = accountData['_primarycontactid_value@OData.Community.Display.V1.FormattedValue'];
        const lookupData: Xrm.LookupValue[] = [{ id: contactId, entityType: "contact", name: contactName }];
        formcontext.getAttribute<Xrm.Attributes.LookupAttribute>('primarycontactid').setValue(lookupData);
       
        //set required level
        let getAttribute: Xrm.Attributes.Attribute<any> = formcontext.getAttribute<Xrm.Attributes.StringAttribute>('websiteurl');
        getAttribute.setRequiredLevel("required");

        //show or hide a column
        let uiAttribute: Xrm.Controls.StandardControl = formcontext.getControl<Xrm.Controls.NumberControl>('industrycode');
        uiAttribute.setVisible(false);
    }

    export async function OpenCustomPage(primaryControl: Xrm.FormContext, customPageName: string): Promise<Xrm.Navigation.CustomPage>
    {
        const recordId: string = primaryControl.data.entity.getId().replace("{", "").replace("}", "");
        
        return new Promise<Xrm.Navigation.CustomPage>(function (resolve, reject)
        {
            const navigationOptions: Xrm.Navigation.NavigationOptions = {
                target: 2,
                position: 1,
                width: { value: 50, unit: "%" },
                height: { value: 50, unit: "%" },
                title: "Custom Page title you want to show to the user"
            };

            const customPage: Xrm.Navigation.CustomPage = {
                pageType: "custom",
                name: customPageName,
                entityName: primaryControl.data.entity.getEntityName(),
                recordId: recordId,
            };

            Xrm.Navigation.navigateTo(customPage, navigationOptions).then(
                function (success) {
                    primaryControl.data.refresh(false);
                    resolve(success);

                }).catch(
                    function (error) {
                        console.log('Error: ', error);
                    }
                );
        });
    }

    export async function CallCustomAPI(primaryControl: Xrm.FormContext) : Promise<Xrm.ExecuteResponse>
    {
        const recordId : string = primaryControl.data.entity.getId().replace("{", "").replace("}", "");

        Xrm.Utility.showProgressIndicator("processing...");
        return new Promise<Xrm.ExecuteResponse>(function (resolve, reject) {
            const execute_name_of_your_custom_apip_Request = {
                // Parameters
                Name_of_your_input_parameter: recordId, // Edm.String

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

            Xrm.WebApi.online.execute(execute_name_of_your_custom_apip_Request).then(
                function success(response) {
                    if (response.ok) {
                        response.json().then(function (results) {
                            const OutputParameter1 = results["OutputParameter1"];
                            const OutputParameter2 = results["OutputParameter2"];
                            const OutputParameter3 = results["OutputParameter3"];
                        });
                        resolve(response);
                    }
                }
            ).then(function (responseBody) {                
                Xrm.Utility.closeProgressIndicator();
            }).catch(function (error) {
                console.log('Error: ', error);
                Xrm.Utility.closeProgressIndicator();
                reject(error);
            });
        });
    }
    export async function callFlow(primaryControl: Xrm.FormContext, flowurl: string): Promise<string>
    {
        const recordId: string = primaryControl.data.entity.getId().replace("{", "").replace("}", "");
        const userId: string = Xrm.Utility.getGlobalContext().userSettings.userId.replace("{", "").replace("}", "");

        Xrm.Utility.showProgressIndicator(`In Progress...`);

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const raw = JSON.stringify({
            "topcount": 10,
            "skipcount": 1,
            "recordId": recordId,
            "userId": userId
        });

        const requestOptions: RequestInit = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };
        
        return new Promise<string>(async function (resolve, reject) {
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
}