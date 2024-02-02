﻿using Microsoft.Xrm.Sdk;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace P365I_CRM.Sales.CustomAPIs
{
    public class CloseOpportunity : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            ITracingService tracingService = (ITracingService)serviceProvider.GetService(typeof(ITracingService));
            IPluginExecutionContext context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            IOrganizationServiceFactory factory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            IOrganizationService service = factory.CreateOrganizationService(context.UserId);

            tracingService.Trace("Start Custom API CloseOpportunity");

            string oppId = (string)context.InputParameters["CloseOpportunity_OppId"];
            string action = (string)context.InputParameters["QualifyProspect_action"];

            Entity opportunity = service.Retrieve("p365i_opportunity", new Guid(oppId), new Microsoft.Xrm.Sdk.Query.ColumnSet(true));
            var oppHandler = new Core.Handlers.OpportunityHandler(tracingService, service);
            oppHandler.CloseOpportunity(opportunity, action, context);

            tracingService.Trace("End Custom API CloseOpportunity");
        }
    }
}