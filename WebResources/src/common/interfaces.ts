namespace P365I_CRM.Common.Interface {

    export interface genericFlow {
        entityLogicalName: string;
        entityId: string;
        initiatingUserId?: string;
    }

    export interface actionResultSet {
        success: boolean;
        resultMessage: string;
        data: object;
    }

    export interface approvalTask {
        statecode: number;
        statuscode: number;
    }

    export interface CRMInformationModel {
        oppid: string;
        accnumber: string;
        company: string;
        RoadTimeMinOrgiNWS: number;
        RoadTimeMinDestNWS: number;
        rentalcode: string;
        ContainerType: string;
        tempcode: string;
        EntityName: string;
        RecordType: string;
    }

    export interface ScopeModel {
        account: string;
        accountGroup: string;
        company: string;
        configId: string;
        country: string;
        culture: string;
        currency: string;
        discountGroup: string;
        priceGroup: string;
        reference: string;
        system: string;
    }

    export interface ConstantsModel {
        configDivId: string;
        bomWS: string;
        bomTab: string;
        bomSection: string;
        configCSS: string;
        configCusCSS: string;
        configDataAttName: string;
        configDirtyAttName: string;
        configTempAttName: string;
        onModelLoaded: Function;
        onModelChange: Function;
        refreshBOMWSonModelLoaded: boolean;
        refreshBOMWSonModelChange: boolean;
    }

    export interface Address {
        street: string;
        housenumber: string;
        postalcode: string;
        city: string;
        addressBlock: string;
    }

    export interface LookupEntity {
        [index: number]: { id: string; name: string; entityType: string };
    }

    export interface LookUpSet {
        targetFieldName: string;
        key: string;
    }

    export interface sendReportRequest {
        recordId: string;
        initUserId?: string;
    }

}