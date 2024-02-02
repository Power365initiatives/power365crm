﻿using Microsoft.Crm.Sdk.Messages;
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
    public class OpportunityProductPostOp : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            var tracingService = (ITracingService)serviceProvider.GetService(typeof(ITracingService));
            var context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            var factory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            var service = factory.CreateOrganizationService(context.UserId);
            var message = context.MessageName.ToLower();

            tracingService.Trace("Start OpportunityProductPostOp");

            if (context.Depth > 1)
                return;

            var target = (Entity)context.InputParameters["Target"];
            var opportunityProductHandler = new OpportunityProductHandler(tracingService, service);

            if (message == "create")
            {
                opportunityProductHandler.UpdateOpportunityDetailAmount(target, message);
            }
            else if (message == "update")
            {
                var postImage = context.PostEntityImages != null && context.PostEntityImages.Contains("PostImage") ? (Entity)context.PostEntityImages["PostImage"] : new Entity();
                opportunityProductHandler.UpdateOpportunityDetailAmount(postImage, string.Empty);
            }                

            tracingService.Trace("End OpportunityProductPostOp");
        }        
    }   
}