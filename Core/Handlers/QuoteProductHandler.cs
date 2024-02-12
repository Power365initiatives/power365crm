using Microsoft.Crm.Sdk.Messages;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Messages;
using P365I_CRM.Core.Helpers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Controls;
using System.Xml.Linq;
using static P365I_CRM.Core.Helpers.Common;

namespace P365I_CRM.Core.Handlers
{
    public class QuoteProductHandler
    {
        private readonly ITracingService _tracingService;
        private readonly IOrganizationService _service;

        public QuoteProductHandler(ITracingService tracingService, IOrganizationService service)
        {
            _tracingService = tracingService;
            _service = service;
        }

        public void UpdateQuoteDetailAmount(Entity quoteProduct, string message)
        {
            _tracingService.Trace("Start UpdateQuoteDetailAmount");

            Entity quote = new Entity("p365i_quote");
            if (message == "create")
            {
                if (quoteProduct.Contains("p365i_selectproduct"))
                {
                    var selectProduct = quoteProduct.GetAttributeValue<Boolean>("p365i_selectproduct");
                    if (!selectProduct) //false
                    {
                        if (quoteProduct.Contains("p365i_existingproduct"))
                        {
                            var existingProductRef = quoteProduct.GetAttributeValue<EntityReference>("p365i_existingproduct");
                            Entity product = _service.Retrieve("p365i_listitem", existingProductRef.Id, new Microsoft.Xrm.Sdk.Query.ColumnSet("p365i_name"));
                            quoteProduct["p365i_product"] = product.GetAttributeValue<string>("p365i_name");
                        }
                        else
                            quoteProduct["p365i_product"] = "new product";
                    }
                    else
                    {
                        var writeInProduct = quoteProduct.GetAttributeValue<string>("p365i_writeinproduct");
                        quoteProduct["p365i_product"] = writeInProduct;
                    }
                }
                else
                    quoteProduct["p365i_product"] = "new product";

                _service.Update(quoteProduct);
            }
            Guid parentId = quoteProduct.GetAttributeValue<EntityReference>("p365i_quote").Id;
            //calculate Detailed Amount
            EntityCollection quoteProducts = Common.QuerybyAttribute(_service, _tracingService, "p365i_quoteproduct", new Microsoft.Xrm.Sdk.Query.ColumnSet("p365i_totalcost"), "p365i_quote", parentId.ToString());
            Decimal detailedAmount = 0;
            foreach (var qProduct in quoteProducts.Entities)
            {
                detailedAmount += qProduct.Attributes.Contains("p365i_totalcost") ? qProduct.GetAttributeValue<Money>("p365i_totalcost").Value : 0;
            }
            quote.Id = parentId;
            quote.Attributes["p365i_detailedamount"] = new Money(detailedAmount);
            _service.Update(quote);
            _tracingService.Trace("End UpdateQuoteDetailAmount");
        }

        public void DeleteQuoteProduct(Guid recordId, IPluginExecutionContext context)
        {
            _tracingService.Trace("Start DeleteQuoteProduct");
            _service.Delete("p365i_quoteproduct", recordId);

            Thread.Sleep(3000);
            context.OutputParameters["DeleteQuoteProduct_RecordIdDeleted"] = recordId.ToString();

            _tracingService.Trace("End DeleteQuoteProduct");
        }        
    }
}
