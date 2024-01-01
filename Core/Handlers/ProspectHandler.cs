using Microsoft.Crm.Sdk.Messages;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Messages;
using P365I_CRM.Core.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using System.Text;
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

                UpdateProspectStatus(prospect, (int)ProspectState.Inactive, (int)ProspectStatus.Qualified);

                Helpers.Common.ExecuteBatchRequest(_service, _tracingService, requestCollection);
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

        private void UpdateProspectStatus(Entity prospect, int state, int status)
        {
            _tracingService.Trace("Start UpdateProspectStatus");

            Entity prospectRecord = new Entity("p365i_prospect", prospect.Id);
            prospectRecord.Attributes.Add("statecode", new OptionSetValue(state));
            prospectRecord.Attributes.Add("statuscode", new OptionSetValue(status));
            requestCollection.Add(new UpdateRequest() { Target = prospectRecord });

            _tracingService.Trace("End UpdateProspectStatus");
        }        
    }
}
