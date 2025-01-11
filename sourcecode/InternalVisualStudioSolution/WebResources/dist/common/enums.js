"use strict";
console.log(`Enums Script Loading...`);
var P365I_CRM;
(function (P365I_CRM) {
    var Common;
    (function (Common) {
        var Enums;
        (function (Enums) {
            let Prospect;
            (function (Prospect) {
                let StateCode;
                (function (StateCode) {
                    StateCode[StateCode["Open"] = 0] = "Open";
                    StateCode[StateCode["Completed"] = 1] = "Completed";
                    StateCode[StateCode["Canceled"] = 2] = "Canceled";
                })(StateCode = Prospect.StateCode || (Prospect.StateCode = {}));
                let StatusCode;
                (function (StatusCode) {
                    StatusCode[StatusCode["Open"] = 1] = "Open";
                    StatusCode[StatusCode["Qualified"] = 446310001] = "Qualified";
                    StatusCode[StatusCode["Disqualified"] = 2] = "Disqualified";
                    StatusCode[StatusCode["Canceled"] = 3] = "Canceled";
                    StatusCode[StatusCode["Scheduled"] = 4] = "Scheduled";
                })(StatusCode = Prospect.StatusCode || (Prospect.StatusCode = {}));
            })(Prospect = Enums.Prospect || (Enums.Prospect = {}));
            let Incident;
            (function (Incident) {
                let IncidentStatus;
                (function (IncidentStatus) {
                    IncidentStatus[IncidentStatus["InProgress"] = 1] = "InProgress";
                    IncidentStatus[IncidentStatus["OnHold"] = 446310001] = "OnHold";
                    IncidentStatus[IncidentStatus["WaitingForDetails"] = 446310002] = "WaitingForDetails";
                    IncidentStatus[IncidentStatus["Researching"] = 446310003] = "Researching";
                    IncidentStatus[IncidentStatus["Inactive"] = 2] = "Inactive";
                    IncidentStatus[IncidentStatus["Resolved"] = 446310004] = "Resolved";
                    IncidentStatus[IncidentStatus["Canceled"] = 446310005] = "Canceled";
                })(IncidentStatus = Incident.IncidentStatus || (Incident.IncidentStatus = {}));
                let IncidentState;
                (function (IncidentState) {
                    IncidentState[IncidentState["Active"] = 0] = "Active";
                    IncidentState[IncidentState["Inactive"] = 1] = "Inactive";
                })(IncidentState = Incident.IncidentState || (Incident.IncidentState = {}));
            })(Incident = Enums.Incident || (Enums.Incident = {}));
        })(Enums = Common.Enums || (Common.Enums = {}));
    })(Common = P365I_CRM.Common || (P365I_CRM.Common = {}));
})(P365I_CRM || (P365I_CRM = {}));
console.log(`Enums Script Loaded...`);
//# sourceMappingURL=enums.js.map