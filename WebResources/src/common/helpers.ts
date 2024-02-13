console.log(`Helper Script Loading...`);

namespace P365I_CRM.Common.Helpers {
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

    export function formDirty(formContext: Xrm.FormContext) : boolean
    {
        let dirty: boolean = formContext.data.entity.getIsDirty();
        if (dirty)
        {
            const alertStrings: Xrm.Navigation.AlertStrings = { confirmButtonLabel: "OK", text: "There are unsaved changes. Please save the form before proceeding.", title: "Warning" };
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

    export function alertDialog(alertStrings: Xrm.Navigation.AlertStrings | undefined, alertOptions: Xrm.Navigation.DialogSizeOptions | undefined, succesCallback: Function | undefined, errorCallback: Function | undefined) : void
    {
        alertStrings = alertStrings ?? { confirmButtonLabel: "Ok", text: "Confirmed", title: "Warning" };
        alertOptions = alertOptions ?? { height: 200, width: 450 };

        Xrm.Navigation.openAlertDialog(alertStrings, alertOptions).then(
            function success(result)
            {
                if (succesCallback)
                {
                    succesCallback(result);
                }
                console.log("Alert dialog closed");
            },
            function (error)
            {
                if (errorCallback)
                {
                    errorCallback(error);
                }
            }
        );
    }

    export function cleanID(input: string) {
        return input.substring(0, 1) === "{" ? input.substring(1, 37) : input;
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
                        primaryControl.data.refresh(false);
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
}

console.log(`Helper Script Loaded...`);