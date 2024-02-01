using Microsoft.Crm.Sdk.Messages;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Messages;
using P365I_CRM.Core.Helpers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Controls;
using System.Xml.Linq;
using static P365I_CRM.Core.Helpers.Common;

namespace P365I_CRM.Core.Handlers
{
    public class OpportunityProductHandler
    {
        private readonly ITracingService _tracingService;
        private readonly IOrganizationService _service;

        public OpportunityProductHandler(ITracingService tracingService, IOrganizationService service)
        {
            _tracingService = tracingService;
            _service = service;
        }

        public void UpdateOpportunityDetailAmount(Entity opportunityProduct, string message)
        {
            _tracingService.Trace("Start UpdateOpportunityDetailAmount");

            Entity opportunity = new Entity("p365i_opportunity");
            if (message == "create")
            {
                if (opportunityProduct.Contains("p365i_selectproduct"))
                {
                    var selectProduct = opportunityProduct.GetAttributeValue<Boolean>("p365i_selectproduct");
                    if (!selectProduct) //false
                    {
                        if (opportunityProduct.Contains("p365i_existingproduct"))
                        {
                            var existingProductRef = opportunityProduct.GetAttributeValue<EntityReference>("p365i_existingproduct");                            
                            Entity product = _service.Retrieve("p365i_listitem", existingProductRef.Id, new Microsoft.Xrm.Sdk.Query.ColumnSet("p365i_name"));
                            opportunityProduct["p365i_product"] = product.GetAttributeValue<string>("p365i_name");
                        }
                        else
                            opportunityProduct["p365i_product"] = "new product";
                    }
                    else
                    {
                        var writeInProduct = opportunityProduct.GetAttributeValue<string>("p365i_writeinproduct");
                        opportunityProduct["p365i_product"] = writeInProduct;
                    }
                }
                else
                    opportunityProduct["p365i_product"] = "new product";
            }

            Guid parentId = opportunityProduct.GetAttributeValue<EntityReference>("p365i_opportunity").Id;
            //calculate Detailed Amount
            EntityCollection oppProducts = Common.QuerybyAttribute(_service, _tracingService, "p365i_opportunityproduct", new Microsoft.Xrm.Sdk.Query.ColumnSet("p365i_totalcost"), "p365i_opportunity", parentId.ToString());

            Decimal detailedAmount = 0;
            foreach (var oppProduct in oppProducts.Entities)
            {
                detailedAmount += oppProduct.Attributes.Contains("p365i_totalcost") ? oppProduct.GetAttributeValue<Money>("p365i_totalcost").Value : 0;
            }

            opportunity.Id = parentId;
            opportunity.Attributes["p365i_detailedamount"] = new Money(detailedAmount);
            
            _service.Update(opportunityProduct);
            _service.Update(opportunity);

            _tracingService.Trace("End UpdateOpportunityDetailAmount");
        }

        public void DeleteOpportunityProduct(Guid recordId, Entity opportunity, IPluginExecutionContext context)
        {
            _tracingService.Trace("Start DeleteOpportunityProduct");

            _service.Delete("p365i_opportunityproduct", recordId);
            UpdateOpportunityDetailAmount(opportunity, string.Empty);

            context.OutputParameters["DeleteProductOpportunity_RecordIdDeleted"] = recordId.ToString();

            _tracingService.Trace("End DeleteOpportunityProduct");
        }

        public Entity GetOppfromChild(Guid recordId) 
        {            
            _tracingService.Trace("Start GetOppfromChild");

            var fetchXml = $@"
                <fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='true'>
                    <entity name='p365i_opportunity'>
                    <attribute name='p365i_opportunityid' />
                    <link-entity name='p365i_opportunityproduct' from='p365i_opportunity' to='p365i_opportunityid' link-type='inner' alias='ac'>
                        <filter type='and'>
                        <condition attribute='p365i_opportunityproductid' operator='eq' uitype='p365i_opportunityproduct' value='{recordId}' />
                        </filter>
                    </link-entity>
                    </entity>
                </fetch>";
            var resultColl = Helpers.Common.getDatabyFetchXML(_service, fetchXml);
                
            _tracingService.Trace("End GetOppfromChild");
            if (resultColl != null && resultColl.Entities.Count > 0)
                return resultColl.Entities.FirstOrDefault();
            else
                return new Entity();
            
        }
    }
}
