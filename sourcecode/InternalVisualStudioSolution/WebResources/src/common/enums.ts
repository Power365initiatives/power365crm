console.log(`Enums Script Loading...`);

namespace P365I_CRM.Common.Enums {   

    export namespace Prospect {
        export enum StateCode {
            Open = 0,
            Completed = 1,
            Canceled = 2,
        }
        export enum StatusCode {
            Open = 1,
            Qualified = 446310001,
            Disqualified = 2,
            Canceled = 3,
            Scheduled = 4
        }
    }

    export namespace Incident {
        export enum IncidentStatus {
            InProgress = 1,
            OnHold = 446310001,
            WaitingForDetails = 446310002,
            Researching = 446310003,
            Inactive = 2,
            Resolved = 446310004,
            Canceled = 446310005
        }

        export enum IncidentState {
            Active = 0,
            Inactive = 1
        }
    }

}

console.log(`Enums Script Loaded...`);