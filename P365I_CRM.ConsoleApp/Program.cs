extern alias Main;
extern alias Core;

using Microsoft.PowerPlatform.Dataverse.Client;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using System;
using System.Collections.Generic;
using System.Configuration;


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

            Entity prospect = service.Retrieve("p365i_prospect", new Guid("d483fe39-cc49-4379-b025-f318312209ab"), new ColumnSet(true));
            var prospectHandler = new Core.P365I_CRM.Core.Handlers.ProspectHandler(tracingService, service);
            prospectHandler.QualifyProspect(prospect.ToEntityReference(), 4, context);
        }
    }
}
