"use strict";
console.log(`Ribbon Script Loading...`);
var P365I_CRM;
(function (P365I_CRM) {
    var Ribbon;
    (function (Ribbon) {
        let Common;
        (function (Common) {
            async function openCustomPage(primaryControl, customPageName, customPageTitle, width, height, action) {
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
                    recordId: P365I_CRM.Common.Helpers.cleanID(primaryControl.data.entity.getId()) + "|" + action,
                };
                const customPageResult = await P365I_CRM.Common.Helpers.openCustomPage(primaryControl, customPage, navigationOptions);
                console.log(`Ribbon openCustomPage Result`, customPageResult);
            }
            Common.openCustomPage = openCustomPage;
        })(Common = Ribbon.Common || (Ribbon.Common = {}));
        let Incident;
        (function (Incident) {
            async function CloseIncident(primaryControl, customPageName, action) {
                console.log(`Function CloseIncident Triggered`);
                try {
                    if (!primaryControl) {
                        console.log('Primary Control not present, abort');
                    }
                    const formContext = primaryControl;
                    if (P365I_CRM.Common.Helpers.formDirty(formContext)) {
                        return;
                    }
                    debugger;
                    const result = await GetOpenActivities(primaryControl);
                    if (result.entities.length > 0) {
                        const confirmStrings = { title: "Open Activities", text: "There are open activities for this incident. Confirming will result in cancelling all open activities" };
                        let confirmAction = await P365I_CRM.Common.Helpers.confirmDialog(confirmStrings, undefined).catch((e) => console.log('Error:', e.message)) || new Object();
                        if (confirmAction.confirmed !== true) {
                            return;
                        }
                    }
                    Common.openCustomPage(primaryControl, customPageName, "Close Incident", 45, 55, action);
                }
                catch (error) {
                    console.log(`Close error`, error);
                    P365I_CRM.Common.Helpers.displayErrorMessage(error);
                }
            }
            Incident.CloseIncident = CloseIncident;
            async function GetOpenActivities(primaryControl) {
                console.log(`Function GetOpenActivities Triggered`);
                const incidentId = P365I_CRM.Common.Helpers.cleanID(primaryControl.data.entity.getId());
                const fetchXML = `<fetch>
	                                <entity name='activitypointer'>
		                                <attribute name='activityid' />
		                                <attribute name='statecode' />
		                                <attribute name='activitytypecode' />
		                                <attribute name='statuscode' />
		                                <filter type='and'>
			                                <condition attribute='statecode' operator='eq' value='0' />
		                                </filter>
                                        <link-entity name="p365i_incident" from="p365i_incidentid" to="regardingobjectid">
                                          <filter>
                                            <condition attribute="p365i_incidentid" operator="eq" value="${incidentId}" />
                                          </filter>
                                        </link-entity>
	                                </entity>
                                </fetch>`;
                const result = await P365I_CRM.Common.Helpers.getDatabyFetchXML("activitypointer", fetchXML);
                return result;
            }
            Incident.GetOpenActivities = GetOpenActivities;
            async function ReactivateIncident(primaryControl) {
                console.log(`Function ReactivateIncident Triggered`);
                try {
                    if (!primaryControl) {
                        console.log('Primary Control not present, abort');
                    }
                    const formContext = primaryControl;
                    if (P365I_CRM.Common.Helpers.formDirty(formContext)) {
                        return;
                    }
                    const confirmStrings = { title: "Reactivate Incident", text: "Are you sure you want to reactivate this incident?" };
                    let confirmAction = await P365I_CRM.Common.Helpers.confirmDialog(confirmStrings, undefined).catch((e) => console.log('Error:', e.message)) || new Object();
                    if (confirmAction.confirmed !== true) {
                        return;
                    }
                    var recordId = P365I_CRM.Common.Helpers.cleanID(primaryControl.data.entity.getId());
                    var record = {};
                    record.statuscode = P365I_CRM.Common.Enums.Incident.IncidentStatus.InProgress;
                    record.statecode = P365I_CRM.Common.Enums.Incident.IncidentState.Active;
                    Xrm.WebApi.updateRecord("p365i_incident", recordId, record).then(function success(result) {
                        primaryControl.data.refresh(false);
                    }, function (error) {
                        console.log(error.message);
                    });
                }
                catch (error) {
                    console.log(`Reactivate error`, error);
                    P365I_CRM.Common.Helpers.displayErrorMessage(error);
                }
            }
            Incident.ReactivateIncident = ReactivateIncident;
        })(Incident = Ribbon.Incident || (Ribbon.Incident = {}));
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
                    Common.openCustomPage(primaryControl, customPageName, "Qualify Prospect", 45, 50, "");
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
                    const confirmStrings = { title: "Disqualify Prospect", text: "Are you sure you want to disqualify this prospect?" };
                    let confirmAction = await P365I_CRM.Common.Helpers.confirmDialog(confirmStrings, undefined).catch((e) => console.log('Error:', e.message)) || new Object();
                    if (confirmAction.confirmed !== true) {
                        return;
                    }
                    var recordId = P365I_CRM.Common.Helpers.cleanID(primaryControl.data.entity.getId());
                    var record = {};
                    record.statuscode = P365I_CRM.Common.Enums.Prospect.StatusCode.Disqualified;
                    record.statecode = P365I_CRM.Common.Enums.Prospect.StateCode.Completed;
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
                        primaryControl.data.refresh(false);
                    }
                }).catch(function (error) {
                    console.log(error.message);
                });
            }
            Quote.CreateQuoteFromOpp = CreateQuoteFromOpp;
        })(Quote = Ribbon.Quote || (Ribbon.Quote = {}));
        let Opportunity;
        (function (Opportunity) {
            async function CloseOpportunity(primaryControl, customPageName, action) {
                console.log(`Function CloseOpportunity Triggered`);
                try {
                    if (!primaryControl) {
                        console.log('Primary Control not present, abort');
                    }
                    const formContext = primaryControl;
                    if (P365I_CRM.Common.Helpers.formDirty(formContext)) {
                        return;
                    }
                    Common.openCustomPage(primaryControl, customPageName, "Close Opportunity", 45, 55, action);
                }
                catch (error) {
                    console.log(`Close error`, error);
                    P365I_CRM.Common.Helpers.displayErrorMessage(error);
                }
                finally {
                    console.log(`Close finally`);
                }
            }
            Opportunity.CloseOpportunity = CloseOpportunity;
        })(Opportunity = Ribbon.Opportunity || (Ribbon.Opportunity = {}));
        let OpportunityProduct;
        (function (OpportunityProduct) {
            async function DeleteOpportunityProduct(primaryControl, selectedControl) {
                console.log(`Function DeleteOpportunityProduct Triggered`);
                if (!primaryControl) {
                    console.log('Primary Control not present, abort');
                }
                const confirmStrings = { title: "Delete opportunity product", text: "Are you sure you want to delete the selected product?" };
                let confirmAction = await P365I_CRM.Common.Helpers.confirmDialog(confirmStrings, undefined).catch((e) => console.log('Error:', e.message)) || new Object();
                if (confirmAction.confirmed !== true) {
                    return;
                }
                let recordId = selectedControl[0];
                recordId = P365I_CRM.Common.Helpers.cleanID(recordId);
                Xrm.Utility.showProgressIndicator("Deleting");
                return new Promise(function (resolve, reject) {
                    const execute_p365i_DeleteProductOpportunity_Request = {
                        DeleteProductOpportunity_recordId: recordId,
                        getMetadata: function () {
                            return {
                                boundParameter: null,
                                parameterTypes: {
                                    DeleteProductOpportunity_recordId: { typeName: "Edm.String", structuralProperty: 1 }
                                },
                                operationType: 0, operationName: "p365i_DeleteProductOpportunity"
                            };
                        }
                    };
                    Xrm.WebApi.online.execute(execute_p365i_DeleteProductOpportunity_Request).then(function success(response) {
                        if (response.ok) {
                            response.json().then(function (results) {
                                debugger;
                                const DeleteProductOpportunity_RecordIdDeleted = results["DeleteProductOpportunity_RecordIdDeleted"];
                                primaryControl.getParentForm().data.refresh(false);
                            });
                            resolve(response);
                        }
                    }).then(function (responseBody) {
                        const result = responseBody;
                        console.log(result);
                        Xrm.Utility.closeProgressIndicator();
                    }).catch(function (error) {
                        console.log(error.message);
                        Xrm.Utility.closeProgressIndicator();
                        reject(error);
                    });
                });
            }
            OpportunityProduct.DeleteOpportunityProduct = DeleteOpportunityProduct;
        })(OpportunityProduct = Ribbon.OpportunityProduct || (Ribbon.OpportunityProduct = {}));
    })(Ribbon = P365I_CRM.Ribbon || (P365I_CRM.Ribbon = {}));
})(P365I_CRM || (P365I_CRM = {}));
console.log(`Ribbon Script Loaded...`);
//# sourceMappingURL=ribbon.js.map