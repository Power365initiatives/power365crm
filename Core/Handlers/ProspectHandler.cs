using Microsoft.Crm.Sdk.Messages;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Messages;
using Microsoft.Xrm.Sdk.Query;
using P365I_CRM.Core.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace P365I_CRM.Core.Handlers
{
    public class ProspectHandler
    {
        private readonly ITracingService _tracingService;
        private readonly IOrganizationService _service;
        private OrganizationRequestCollection requestCollection;

        public ProspectHandler(ITracingService tracingService, IOrganizationService service)
        {
            _tracingService = tracingService;
            _service = service;
        }

        public void QualifyProspect(Entity prospect, bool createAccount, bool createContact, bool createOpp, IPluginExecutionContext context)
        {
            _tracingService.Trace("Start QualifyProspect");

            requestCollection = new OrganizationRequestCollection();            
            try 
            {
                EntityReference opportunity = new EntityReference();
                EntityReference account = new EntityReference();
                EntityReference contact = new EntityReference();

                if (createAccount) //create account
                {
                    account = CreateEntityFromProspect(prospect, null, null, "account");
                }
                if (createContact) //create contact
                {
                    contact = CreateEntityFromProspect(prospect, account, null, "contact");
                }
                if (createOpp) //create Opp
                {
                    opportunity = CreateEntityFromProspect(prospect, account, contact, "p365i_opportunity");
                }
                
                UpdateProspect(prospect, (int)ProspectState.Inactive, (int)ProspectStatus.Qualified, account, contact);
                
                Helpers.Common.ExecuteBatchRequest(_service, _tracingService, requestCollection);
                UpdateBPFStage(opportunity);
                context.OutputParameters["QualifyProspect_oppId"] = opportunity.Id.ToString();
                context.OutputParameters["QualifyProspect_resultMessage"] = "Prospect qualified";
            }
            catch (Exception ex)
            {
                context.OutputParameters["QualifyProspect_oppId"] = null;
                context.OutputParameters["QualifyProspect_resultMessage"] = ex.Message;
            }

            _tracingService.Trace("End QualifyProspect");
        }
        private EntityReference CreateEntityFromProspect(Entity prospect, EntityReference accountRef, EntityReference contactRef, string entityTarget)
        {
            _tracingService.Trace("Start CreateEntityFromProspect");

            EntityReference prospectRef = prospect.ToEntityReference();

            if (entityTarget == "account")
            {
                if (!prospect.Contains("p365i_parentaccountid"))
                {
                    Entity account = Helpers.Common.CreateEntityfromMapping(_service, prospectRef, entityTarget, TargetFieldType.All);
                    account.Id = Guid.NewGuid();
                    requestCollection.Add(new CreateRequest() { Target = account });

                    _tracingService.Trace("Account added to collection");
                    return account.ToEntityReference();
                }
                else
                    return prospect.GetAttributeValue<EntityReference>("p365i_parentaccountid");
            }
            else if (entityTarget == "contact")
            {
                if (!prospect.Contains("p365i_parentcontactfid"))
                {
                    Entity contact = Helpers.Common.CreateEntityfromMapping(_service, prospectRef, entityTarget, TargetFieldType.All);
                    contact.Id = Guid.NewGuid();
                    if (accountRef.Id != Guid.Empty)
                    {
                        contact.Attributes.Add("parentcustomerid", accountRef);
                        contact.Attributes.Add("accountid", accountRef);                        
                    }
                    else
                    {
                        if (prospect.Contains("p365i_parentaccountid"))
                        {
                            EntityReference accountRef2 = prospect.GetAttributeValue<EntityReference>("p365i_parentaccountid");
                            contact.Attributes.Add("parentcustomerid", accountRef2);
                            contact.Attributes.Add("accountid", accountRef2);                        
                        }
                    }
                    requestCollection.Add(new CreateRequest() { Target = contact });

                    _tracingService.Trace("Contact added to collection");
                    return contact.ToEntityReference();
                }
                else
                    return prospect.GetAttributeValue<EntityReference>("p365i_parentcontactfid");
            }
            else //opportunity
            {
                Entity opportunity = Helpers.Common.CreateEntityfromMapping(_service, prospectRef, entityTarget, TargetFieldType.All);
                opportunity.Id = Guid.NewGuid();
                if (accountRef.Id != Guid.Empty)
                    opportunity.Attributes.Add("p365i_parentaccountid", accountRef);
                else
                {
                    if (prospect.Contains("p365i_parentaccountid"))
                    {
                        EntityReference accountRef2 = prospect.GetAttributeValue<EntityReference>("p365i_parentaccountid");
                        opportunity.Attributes.Add("p365i_parentaccountid", accountRef2);
                    }
                }
                if (contactRef.Id != Guid.Empty)
                    opportunity.Attributes.Add("p365i_parentcontactid", contactRef);
                else
                {
                    if (prospect.Contains("p365i_parentcontactfid"))
                    {
                        EntityReference contactRef2 = prospect.GetAttributeValue<EntityReference>("p365i_parentcontactfid");
                        opportunity.Attributes.Add("p365i_parentcontactid", contactRef2);
                    }
                }
                requestCollection.Add(new CreateRequest() { Target = opportunity });

                _tracingService.Trace("Opportunity added to collection");
                return opportunity.ToEntityReference();
            }           
        }

        private void UpdateProspect(Entity prospect, int state, int status, EntityReference account, EntityReference contact)
        {
            _tracingService.Trace("Start UpdateProspect");

            Entity prospectRecord = new Entity("p365i_prospect", prospect.Id);
            prospectRecord.Attributes.Add("statecode", new OptionSetValue(state));
            prospectRecord.Attributes.Add("statuscode", new OptionSetValue(status));
            if (account.Id != Guid.Empty)
            {
                prospectRecord.Attributes.Add("p365i_parentaccountid", account);
            }
            if (contact.Id != Guid.Empty)
            {                
                prospectRecord.Attributes.Add("p365i_parentcontactfid", contact);                
            }
            requestCollection.Add(new UpdateRequest() { Target = prospectRecord });

            _tracingService.Trace("End UpdateProspect");
        }

        public void UpdateBPFStage(EntityReference target)
        {
            _tracingService.Trace("Start UpdateBPFStage");

            _tracingService.Trace($"target.Id={target.Id}, target.LogicalName={target.LogicalName}");

            RetrieveProcessInstancesRequest req = new RetrieveProcessInstancesRequest() { EntityId = target.Id, EntityLogicalName = target.LogicalName };
            RetrieveProcessInstancesResponse response = (RetrieveProcessInstancesResponse)_service.Execute(req);

            if (response?.Processes != null && response.Processes?.Entities != null && response.Processes.Entities.Count > 0)
            {
                //Retrieve the active stage id
                Guid stageId = response.Processes.Entities[0].GetAttributeValue<Guid>("processstageid");
                string activeStageName = GetActiveStageName(stageId);
                string newStageName = "Develop";
                _tracingService.Trace($"stageId={stageId}, activeStageName={activeStageName}, newStageName={newStageName}");

                if (!newStageName.Equals(activeStageName, StringComparison.InvariantCultureIgnoreCase))
                {
                    Guid processId = response.Processes.Entities[0].Id;
                    _tracingService.Trace($"processId={processId}");

                    //get all stages for the BPF
                    RetrieveActivePathResponse pathResp = GetPathResponse(processId);

                    if (pathResp?.ProcessStages != null && pathResp.ProcessStages?.Entities != null && pathResp.ProcessStages.Entities.Count > 0)
                    {
                        // iterate the stages to find the new EntityReference of the stage you want to set as the active one
                        Entity newStage = pathResp.ProcessStages.Entities.ToList().Where(stage => newStageName.Equals(stage.GetAttributeValue<string>("stagename"), StringComparison.InvariantCultureIgnoreCase)).FirstOrDefault();
                        _tracingService.Trace($"newStageId={newStage.Id}");

                        if (newStage != null)
                        {
                            Entity update = new Entity("p365i_salesprocess", processId); //the business process flow entity
                            update["activestageid"] = newStage.ToEntityReference();
                            _service.Update(update);

                            _tracingService.Trace($"Updated bpf with id={processId} with activestageid={newStage.Id}");
                        }
                    }
                }
            }
            else
            {
                Thread.Sleep(2000); // Sleep for 2 seconds
                UpdateBPFStage(target);
            }

            _tracingService.Trace("End UpdateBPFStage");
        }

        private RetrieveActivePathResponse GetPathResponse(Guid processId)
        {
            _tracingService.Trace("Start GetPathResponse");

            RetrieveActivePathRequest pathReq = new RetrieveActivePathRequest
            {
                ProcessInstanceId = processId
            };
            RetrieveActivePathResponse pathResp = (RetrieveActivePathResponse)_service.Execute(pathReq);

            _tracingService.Trace("End GetPathResponse");
            return pathResp;
        }

        private string GetActiveStageName(Guid stageId)
        {
            _tracingService.Trace("Start GetActiveStageName");

            Entity stageEnt = _service.Retrieve("processstage", stageId, new ColumnSet("stagename"));
            string activeStageName = stageEnt.GetAttributeValue<string>("stagename");

            _tracingService.Trace("End GetActiveStageName");
            return activeStageName;
        }
    }
}
