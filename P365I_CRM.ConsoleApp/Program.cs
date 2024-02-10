extern alias Main;
extern alias Core;

using Microsoft.PowerPlatform.Dataverse.Client;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;

using System;
using System.Collections.Generic;
using System.Configuration;
using static System.Windows.Forms.VisualStyles.VisualStyleElement.TextBox;


namespace P365I_CRM.Console
{
    public class Program
    {
        static void Main(string[] args)
        {
            ServiceClient.MaxConnectionTimeout = new TimeSpan(0, 15, 0); //Set the Timeout to 15 minutes. Processes created in D365 combined with action can go over the 2 minute timeout.
            ServiceClient service = new ServiceClient(ConfigurationManager.ConnectionStrings["DevUser"].ConnectionString);
            ITracingService tracingService = new Core.P365I_CRM.Core.Helpers.Common.TracingService();
            var context = new Core.P365I_CRM.Core.Helpers.Common.PluginContext();


            /*Entity OppProduct = service.Retrieve("p365i_opportunityproduct", new Guid("e1cf2578-a4a8-ee11-be37-00224840d636"), new ColumnSet(true));
            //calculate Detailed Amount
            EntityCollection oppProducts = QuerybyAttribute(service, tracingService, "p365i_opportunityproduct", new Microsoft.Xrm.Sdk.Query.ColumnSet("p365i_totalcost"), "p365i_opportunity", (OppProduct.GetAttributeValue<EntityReference>("p365i_opportunity")).Id.ToString());
            tracingService.Trace("oppProducts count: " + oppProducts.Entities.Count);
            Decimal detailedAmount = 0;
            foreach (var oppProduct in oppProducts.Entities)
            {
                detailedAmount += oppProduct.GetAttributeValue<Money>("p365i_totalcost").Value;
            }
            tracingService.Trace("detailedAmount: " + detailedAmount.ToString());


            Guid ParentId = ((EntityReference)OppProduct.Attributes["p365i_opportunity"]).Id;
            Entity opp = new Entity("p365i_opportunity");
            opp.Id = ParentId;
            opp.Attributes["p365i_detailedamount"] = new Money(detailedAmount);
            service.Update(opp);*/


            Entity opportunity = service.Retrieve("p365i_prospect", new Guid("c3d54c3f-0180-4029-a7dc-258750015f25"), new ColumnSet(true));
            var prospectHandler = new Core.P365I_CRM.Core.Handlers.ProspectHandler(tracingService, service);
            prospectHandler.UpdateBPFStage(opportunity.ToEntityReference());
        }

        public static EntityCollection QuerybyAttribute(IOrganizationService service, ITracingService tracingServive, String entityName, ColumnSet columns, String attributeName, String attributeValue)
        {
            QueryByAttribute querybyexpression = new QueryByAttribute(entityName);
            querybyexpression.ColumnSet = columns;
            querybyexpression.Attributes.AddRange(attributeName);
            querybyexpression.Values.AddRange(attributeValue);
            return service.RetrieveMultiple(querybyexpression);
        }
    }
}
