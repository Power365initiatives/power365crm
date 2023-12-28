using Microsoft.Xrm.Sdk;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace P365I_CRM.Main.CustomAPIs
{
    public class QualifyProspect : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            ITracingService tracingService = (ITracingService)serviceProvider.GetService(typeof(ITracingService));
            IPluginExecutionContext context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            IOrganizationServiceFactory factory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            IOrganizationService service = factory.CreateOrganizationService(context.UserId);

            tracingService.Trace("Start Custom API QualifyLead");

            int creationType = (int)context.InputParameters["QualifyProspect_creationtype"];
            string prospectId = context.InputParameters["QualifyProspect_prospectid"].ToString();

            Entity prospect = service.Retrieve("p365i_prospect", new Guid(prospectId), new Microsoft.Xrm.Sdk.Query.ColumnSet(true));
            var prospectHandler = new Core.Handlers.ProspectHandler(tracingService, service);
            prospectHandler.QualifyProspect(prospect, creationType, context);

            tracingService.Trace("End Custom API QualifyLead");
        }
    }
}
