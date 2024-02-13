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

}

console.log(`Enums Script Loaded...`);