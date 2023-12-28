console.log(`Enums Script Loading...`);

namespace P365I_CRM.Common.Enums {

    export namespace Account {

        export enum StateCode {
            Inactive = 1,
            Active = 0
        }

        export enum StatusCode {
            Inactive = 1,
            Active = 0
        }

        export enum Fields {
            EntityName = `account`,
            Id = `accountid`,
            NumberOfEmployees = `numberofemployees`
        }
    }

    export namespace Contact {

        export enum StateCode {
            Inactive = 1,
            Active = 0
        }

        export enum StatusCode {
            Inactive = 1,
            Active = 0
        }

        export enum Fields {
            EntityName = "contact",
            Id = "contactid"
        }
    }

    export namespace Prospect {
        export enum StateCode {
            Open = 0,
            Completed = 1,
            Canceled = 2,
        }
        export enum StatusCode {
            Open = 1,
            Qualified = 446310001,
            Canceled = 3,
            Scheduled = 4
        }
    }

}

console.log(`Enums Script Loaded...`);