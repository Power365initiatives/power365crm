using Microsoft.Crm.Sdk.Messages;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Messages;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Remoting.Contexts;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Controls;

namespace P365I_CRM.Core.Handlers
{
    public class OpportunityHandler
    {
        private readonly ITracingService _tracingService;
        private readonly IOrganizationService _service;
        private OrganizationRequestCollection requestCollection;

        public OpportunityHandler(ITracingService tracingService, IOrganizationService service)
        {
            _tracingService = tracingService;
            _service = service;
        }

        public void CreateQuoteFromOpportunity(EntityReference oppRef, IPluginExecutionContext context)
        {
            _tracingService.Trace("Start CreateQuoteFromOpportunity");

            requestCollection = new OrganizationRequestCollection();
            try
            {
                Entity quote = CreateQuoteFromOppRef(oppRef);
                EntityCollection oppLinesColl = GetOppLinesByOppId(oppRef);
                CreateQuoteLinesFromCollection(oppLinesColl, quote);

                Helpers.Common.ExecuteBatchRequest(_service, _tracingService, requestCollection);

                context.OutputParameters["CreateQuoteFromOpp_quoteId"] = quote.Id.ToString();
                context.OutputParameters["CreateQuoteFromOpp_resultMessage"] = "Quote Created";
            }
            catch (Exception ex)
            {
                context.OutputParameters["quoteId"] = null;
                context.OutputParameters["resultMessage"] = ex.Message;
            }

            _tracingService.Trace("End CreateQuoteFromOpportunity");
        }

        private Entity CreateQuoteFromOppRef(EntityReference oppRef)
        {
            _tracingService.Trace("Start CreateQuoteFromOppRef");

            Entity quote = Helpers.Common.CreateEntityfromMapping(_service, oppRef, "p365i_quote", TargetFieldType.All);
            quote.Id = Guid.NewGuid();
            requestCollection.Add(new CreateRequest() { Target = quote });

            _tracingService.Trace("End CreateQuoteFromOppRef");
            return quote;
        }

        private EntityCollection GetOppLinesByOppId(EntityReference oppRef)
        {
            _tracingService.Trace("Start GetOppLinesByOppId");

            string fetchXML = $@"<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'>
                                  <entity name='p365i_opportunityproduct'>
                                    <attribute name='p365i_opportunityproductid' />
                                    <attribute name='p365i_product' />
                                    <filter type='and'>
                                      <condition attribute='p365i_opportunity' operator='eq' uitype='p365i_opportunity' value='{oppRef.Id}' />
                                    </filter>
                                  </entity>
                                </fetch>";

            _tracingService.Trace("End GetOppLinesByOppId");
            return Helpers.Common.getDatabyFetchXML(_service, fetchXML);
        }

        private void CreateQuoteLinesFromCollection(EntityCollection oppLinesColl, Entity quote)
        {
            _tracingService.Trace("Start CreateQuoteLinesFromCollection");

            foreach (var oppLine in oppLinesColl.Entities)
            {
                Entity quoteLine = Helpers.Common.CreateEntityfromMapping(_service, oppLine.ToEntityReference(), "p365i_quoteproduct", TargetFieldType.All);
                quoteLine.Id = Guid.NewGuid();
                quoteLine.Attributes.Add("p365i_quote", quote.ToEntityReference());
                requestCollection.Add(new CreateRequest() { Target = quoteLine });                
            }

            _tracingService.Trace("End CreateQuoteLinesFromCollection");
        }

        public void CloseOpportunity(Entity opportunity, string action, IPluginExecutionContext context)
        {
            _tracingService.Trace("Start CloseOpportunity");

            var openQuotes = GetOpenQuotes(opportunity.ToEntityReference());
            if (action == "win")
            {
                if (openQuotes.Entities.Count > 1)
                {
                    context.OutputParameters["CloseOpportunity_resultMessage"] = "There are more than 1 open quotes for this opportunity. Please close them first.";
                }
                else if (openQuotes.Entities.Count == 1)
                {
                }
                else
                {
                    Entity quote = openQuotes.Entities[0];
                    quote.Attributes["statecode"] = new OptionSetValue(1);
                    quote.Attributes["statuscode"] = new OptionSetValue(3);
                    requestCollection.Add(new UpdateRequest() { Target = quote });

                    opportunity.Attributes["statecode"] = new OptionSetValue(1);
                    opportunity.Attributes["statuscode"] = new OptionSetValue(3);
                    requestCollection.Add(new UpdateRequest() { Target = opportunity });
                }
            }
            else
            {
                foreach(var quoteToClose in openQuotes.Entities)
                {                    
                    quoteToClose.Attributes["statecode"] = new OptionSetValue(1);
                    quoteToClose.Attributes["statuscode"] = new OptionSetValue(3);
                    requestCollection.Add(new UpdateRequest() { Target = quoteToClose });                
                }

                opportunity.Attributes["statecode"] = new OptionSetValue(1);
                opportunity.Attributes["statuscode"] = new OptionSetValue(3);
                requestCollection.Add(new UpdateRequest() { Target = opportunity });
            }

            _tracingService.Trace("End CloseOpportunity");
        }

        private EntityCollection GetOpenQuotes(EntityReference OppRef)
        {
            _tracingService.Trace("Start GetOpenQuotes");

            string fetchXML = $@"<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'>
                                  <entity name='p365i_quote'>
                                    <attribute name='p365i_quoteid' />
                                    <attribute name='p365i_name' />
                                    <attribute name='p365i_totalamount' />
                                    <attribute name='p365i_quotestatus' />
                                    <order attribute='p365i_name' descending='false' />
                                    <filter type='and'>
                                        <condition attribute='statecode' operator='eq' value='0' />
                                        <condition attribute='p365i_opportunity' operator='eq' uitype='p365i_opportunity' value='{OppRef.Id}' />
                                    </filter>
                                  </entity>
                                </fetch>";

            _tracingService.Trace("End GetOpenQuotes");
            return Helpers.Common.getDatabyFetchXML(_service, fetchXML);
        }
    }
}
