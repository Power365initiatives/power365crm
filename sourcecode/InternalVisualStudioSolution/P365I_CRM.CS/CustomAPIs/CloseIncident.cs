using Microsoft.Xrm.Sdk;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace P365I_CRM.CS.CustomAPIs
{
    public class CloseIncident : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            ITracingService tracingService = (ITracingService)serviceProvider.GetService(typeof(ITracingService));
            IPluginExecutionContext context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            IOrganizationServiceFactory factory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            IOrganizationService service = factory.CreateOrganizationService(context.UserId);

            tracingService.Trace("Start Custom API CloseIncident");

            string CloseIncident_IncidentId = (string)context.InputParameters["CloseIncident_IncidentId"];
            string CloseIncident_action = (string)context.InputParameters["CloseIncident_action"];
            string CloseIncident_incidentresolution = (string)context.InputParameters["CloseIncident_incidentresolution"];
            string CloseIncident_ResolutionTypeText = (string)context.InputParameters["CloseIncident_ResolutionTypeText"];

            Entity incident = service.Retrieve("p365i_incident", new Guid(CloseIncident_IncidentId), new Microsoft.Xrm.Sdk.Query.ColumnSet(true));
            var incHandler = new Core.Handlers.IncidentHandler(tracingService, service);
            incHandler.CloseIncident(incident, CloseIncident_action, CloseIncident_incidentresolution, CloseIncident_ResolutionTypeText, context);

            tracingService.Trace("End Custom API CloseIncident");
        }
    }
}
