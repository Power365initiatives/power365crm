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

            bool createAccount = (bool)context.InputParameters["QualifyProspect_account"];
            bool createContact = (bool)context.InputParameters["QualifyProspect_contact"];
            bool createOpp = (bool)context.InputParameters["QualifyProspect_opportunity"];
            string prospectId = context.InputParameters["QualifyProspect_prospectid"].ToString();

            Entity prospect = service.Retrieve("p365i_prospect", new Guid(prospectId), new Microsoft.Xrm.Sdk.Query.ColumnSet(true));
            var prospectHandler = new Core.Handlers.ProspectHandler(tracingService, service);
            prospectHandler.QualifyProspect(prospect, createAccount, createContact, createOpp, context);

            tracingService.Trace("End Custom API QualifyLead");
        }
    }
}
