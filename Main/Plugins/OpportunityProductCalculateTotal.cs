using Microsoft.Crm.Sdk.Messages;
using Microsoft.Xrm.Sdk;
using P365I_CRM.Core.Helpers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.Text;
using System.Threading.Tasks;
using static P365I_CRM.Core.Helpers.Common;

namespace P365I_CRM.Main.Plugins
{
    public class OpportunityProductCalculateTotal : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            ITracingService tracingService = (ITracingService)serviceProvider.GetService(typeof(ITracingService));
            IPluginExecutionContext context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            IOrganizationServiceFactory factory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            IOrganizationService service = factory.CreateOrganizationService(context.UserId);

            tracingService.Trace("Start Opportunity calculate total");
            string _FieldName = "p365i_totalamount";
            Entity target, image = null;
           
           
            if (context.InputParameters.Contains("Target"))
            {
                if (context.InputParameters["Target"] is Entity || context.InputParameters["Target"] is EntityReference)
                {
                    try
                    {
                        //Create & Update
                        tracingService.Trace("pas 0");
                        if (context.MessageName == "Create" || context.MessageName == "Update")
                        {
                            tracingService.Trace("pas 1");
                            tracingService.Trace("pas 1o");
                            image = (Entity)context.PostEntityImages["Image"];
                        }
                        else if(context.MessageName == "Delete")
                        {
                            tracingService.Trace("pas 2");
                            image = (Entity)context.PreEntityImages["Image"];
                        }


                        
                        tracingService.Trace("pas 11");
                        
                        Guid ParentId = (image.GetAttributeValue<EntityReference>("p365i_opportunity")).Id;

                        tracingService.Trace("pas 3");
                        //calculate Detailed Amount
                        EntityCollection oppProducts = Common.QuerybyAttribute(service, tracingService, "p365i_opportunityproduct", new Microsoft.Xrm.Sdk.Query.ColumnSet("p365i_totalcost"), "p365i_opportunity", ParentId.ToString());
                        tracingService.Trace("oppProducts count: " + oppProducts.Entities.Count);
                        Decimal detailedAmount = 0;
                        foreach (var oppProduct in oppProducts.Entities)
                        {
                            tracingService.Trace("oppProducts contains: " + oppProduct.Attributes.Contains("p365i_totalcost"));
                            detailedAmount += oppProduct.Attributes.Contains("p365i_totalcost") ? oppProduct.GetAttributeValue<Money>("p365i_totalcost").Value : 0;
                        }
                        tracingService.Trace("detailedAmount: " + detailedAmount.ToString());
                        tracingService.Trace("pas 4");
                        Entity opp = new Entity("p365i_opportunity");
                        opp.Id = ParentId;
                        opp.Attributes["p365i_detailedamount"] = new Money(detailedAmount);
                        service.Update(opp);
                        tracingService.Trace("Opp updated: " + detailedAmount.ToString());
                        tracingService.Trace("pas 5");
                    }
                    catch (FaultException<OrganizationServiceFault> ex)
                    {
                        throw new InvalidPluginExecutionException("An error occurred in opportunity calculate total.", ex);
                    }

                    catch (Exception ex)
                    {
                        tracingService.Trace("pportunity calculate total: {0}", ex.ToString());
                        throw;
                    }
                }
            }
            tracingService.Trace("End Opportunity calculate total");
        }

        public static String GetOpportunityProducts(IOrganizationService service, ITracingService tracingService, String OppId)
        {
            var fetchXml = $@"<fetch>
                      <entity name='environmentvariabledefinition'>
                        <attribute name='defaultvalue' />
                        <filter type='and'>
                          <condition attribute='schemaname' operator='eq' value='{OppId}'/>
                        </filter>
                        <link-entity name='environmentvariablevalue' from='environmentvariabledefinitionid' to='environmentvariabledefinitionid' link-type='outer' alias='envvarvalue'>
                          <attribute name='value' />
                        </link-entity>
                      </entity>
                    </fetch>";

            Entity result = Common.getDatabyFetchXML(service, fetchXml).Entities.FirstOrDefault();
            String defaultValue = result.GetAttributeValue<String>("defaultvalue");
            String currentValue = Common.ReturnValueFromAlias<String>(result, "envvarvalue.value");
            return !String.IsNullOrEmpty(currentValue) ? currentValue : defaultValue;
        }
    }
   
}