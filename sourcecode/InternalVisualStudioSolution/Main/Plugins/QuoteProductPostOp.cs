using Microsoft.Crm.Sdk.Messages;
using Microsoft.Xrm.Sdk;
using P365I_CRM.Core.Handlers;
using P365I_CRM.Core.Helpers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.ServiceModel.Channels;
using System.Text;
using System.Threading.Tasks;
using static P365I_CRM.Core.Helpers.Common;

namespace P365I_CRM.Sales.Plugins
{
    public class QuoteProductPostOp : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            var tracingService = (ITracingService)serviceProvider.GetService(typeof(ITracingService));
            var context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            var factory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            var service = factory.CreateOrganizationService(context.UserId);
            var message = context.MessageName.ToLower();

            tracingService.Trace("Start QuoteProductPostOp");

            var quoteProductHandler = new QuoteProductHandler(tracingService, service);

            if (message == "create")
            {
                if (context.Depth > 3)
                    return;
                var target = (Entity)context.InputParameters["Target"];
                quoteProductHandler.UpdateQuoteDetailAmount(target, message);
            }
            else if (message == "update")
            {
                if (context.Depth > 1)
                    return;

                var postImage = context.PostEntityImages != null && context.PostEntityImages.Contains("PostImage") ? (Entity)context.PostEntityImages["PostImage"] : new Entity();
                quoteProductHandler.UpdateQuoteDetailAmount(postImage, string.Empty);
            }
            else if (message == "delete")
            {
                var preImage = context.PreEntityImages != null && context.PreEntityImages.Contains("PreImage") ? (Entity)context.PreEntityImages["PreImage"] : new Entity();
                quoteProductHandler.UpdateQuoteDetailAmount(preImage, message);
            }

            tracingService.Trace("End QuoteProductPostOp");
        }
    }
}