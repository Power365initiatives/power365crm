using Microsoft.Xrm.Sdk;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace P365I_CRM.Sales.CustomAPIs
{
    internal class DeleteProductOpportunity : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            ITracingService tracingService = (ITracingService)serviceProvider.GetService(typeof(ITracingService));
            IPluginExecutionContext context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            IOrganizationServiceFactory factory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            IOrganizationService service = factory.CreateOrganizationService(context.UserId);

            tracingService.Trace("Start Custom API DeleteProductOpportunity");

            var recordId = new Guid((string)context.InputParameters["DeleteProductOpportunity_recordId"]);
            var oppProductHandler = new Core.Handlers.OpportunityProductHandler(tracingService, service);
            var oppRecord = oppProductHandler.GetOppfromChild(recordId);
            
            oppProductHandler.DeleteOpportunityProduct(recordId, oppRecord, context);

            tracingService.Trace("End Custom API DeleteProductOpportunity");
        }
    }
}
