"use strict";
console.log(`Enums Script Loading...`);
var P365I_CRM;
(function (P365I_CRM) {
    var Common;
    (function (Common) {
        var Enums;
        (function (Enums) {
            let Account;
            (function (Account) {
                let StateCode;
                (function (StateCode) {
                    StateCode[StateCode["Inactive"] = 1] = "Inactive";
                    StateCode[StateCode["Active"] = 0] = "Active";
                })(StateCode = Account.StateCode || (Account.StateCode = {}));
                let StatusCode;
                (function (StatusCode) {
                    StatusCode[StatusCode["Inactive"] = 1] = "Inactive";
                    StatusCode[StatusCode["Active"] = 0] = "Active";
                })(StatusCode = Account.StatusCode || (Account.StatusCode = {}));
                let Fields;
                (function (Fields) {
                    Fields["EntityName"] = "account";
                    Fields["Id"] = "accountid";
                    Fields["NumberOfEmployees"] = "numberofemployees";
                })(Fields = Account.Fields || (Account.Fields = {}));
            })(Account = Enums.Account || (Enums.Account = {}));
            let Contact;
            (function (Contact) {
                let StateCode;
                (function (StateCode) {
                    StateCode[StateCode["Inactive"] = 1] = "Inactive";
                    StateCode[StateCode["Active"] = 0] = "Active";
                })(StateCode = Contact.StateCode || (Contact.StateCode = {}));
                let StatusCode;
                (function (StatusCode) {
                    StatusCode[StatusCode["Inactive"] = 1] = "Inactive";
                    StatusCode[StatusCode["Active"] = 0] = "Active";
                })(StatusCode = Contact.StatusCode || (Contact.StatusCode = {}));
                let Fields;
                (function (Fields) {
                    Fields["EntityName"] = "contact";
                    Fields["Id"] = "contactid";
                })(Fields = Contact.Fields || (Contact.Fields = {}));
            })(Contact = Enums.Contact || (Enums.Contact = {}));
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
                    StatusCode[StatusCode["Canceled"] = 3] = "Canceled";
                    StatusCode[StatusCode["Scheduled"] = 4] = "Scheduled";
                })(StatusCode = Prospect.StatusCode || (Prospect.StatusCode = {}));
            })(Prospect = Enums.Prospect || (Enums.Prospect = {}));
        })(Enums = Common.Enums || (Common.Enums = {}));
    })(Common = P365I_CRM.Common || (P365I_CRM.Common = {}));
})(P365I_CRM || (P365I_CRM = {}));
console.log(`Enums Script Loaded...`);
//# sourceMappingURL=enums.js.map