using Microsoft.Xrm.Sdk;
using P365I_CRM.Core.Handlers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace P365I_CRM.Sales.Plugins
{
    public class OpportunityPostOp : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            var tracingService = (ITracingService)serviceProvider.GetService(typeof(ITracingService));
            var context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            var factory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            var service = factory.CreateOrganizationService(context.UserId);
            var message = context.MessageName.ToLower();

            tracingService.Trace("Start OpportunityPostOp");

            if (context.Depth > 2)
                return;

            var target = (Entity)context.InputParameters["Target"];
            var opportunityHandler = new OpportunityHandler(tracingService, service);

            if (message == "update")
            { 
                var postImage = context.PostEntityImages != null && context.PostEntityImages.Contains("PostImage") ? (Entity)context.PostEntityImages["PostImage"] : new Entity();
                opportunityHandler.UpdateOpportunityRevenue(postImage);
            }

            tracingService.Trace("End OpportunityPostOp");
        }
    }
}
