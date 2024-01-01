using Microsoft.Xrm.Sdk;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace P365I_CRM.Main.CustomAPIs
{
    public class CreateQuoteFromOpp : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            ITracingService tracingService = (ITracingService)serviceProvider.GetService(typeof(ITracingService));
            IPluginExecutionContext context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            IOrganizationServiceFactory factory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            IOrganizationService service = factory.CreateOrganizationService(context.UserId);

            tracingService.Trace("Start Custom API CreateQuoteFromOpp");

            EntityReference oppRef = new EntityReference(context.PrimaryEntityName, context.PrimaryEntityId);
            var oppHandler = new Core.Handlers.OpportunityHandler(tracingService, service);
            oppHandler.CreateQuoteFromOpportunity(oppRef, context);

            tracingService.Trace("End Custom API CreateQuoteFromOpp");
        }
    }
}
