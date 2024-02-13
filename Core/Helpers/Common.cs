using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Xml;
using Microsoft.Xrm.Sdk;
using Newtonsoft.Json;
using Microsoft.Crm.Sdk.Messages;
using Microsoft.Xrm.Sdk.Query;
using Microsoft.Xrm.Sdk.Workflow;
using Microsoft.Xrm.Sdk.Messages;
using Core.Extensions;
using Microsoft.Xrm.Sdk.Metadata.Query;
using Microsoft.Xrm.Sdk.Metadata;

namespace P365I_CRM.Core.Helpers
{
    public class Common
    {

        public static Entity CreateEntityfromMapping(IOrganizationService service, EntityReference sourceEntityRef, String targetEntityName, TargetFieldType targetFieldType)
        {
            InitializeFromRequest initializeFromRequest = new InitializeFromRequest();
            initializeFromRequest.EntityMoniker = sourceEntityRef;
            initializeFromRequest.TargetEntityName = targetEntityName;
            initializeFromRequest.TargetFieldType = targetFieldType;

            InitializeFromResponse initializeFromResponse = (InitializeFromResponse)service.Execute(initializeFromRequest);
            return initializeFromResponse.Entity;
        }

        public static EntityCollection getDatabyFetchXML(IOrganizationService service, String fetchXml)
        {
            EntityCollection resultCollection = new EntityCollection();

            var conversionRequest = new FetchXmlToQueryExpressionRequest
            {
                FetchXml = fetchXml
            };

            var conversionResponse = (FetchXmlToQueryExpressionResponse)service.Execute(conversionRequest);

            QueryExpression query = conversionResponse.Query;

            var pageNumber = 1;
            var pageSize = 250;
            string pagingCookie = null;

            while (true)
            {
                query.PageInfo = new PagingInfo()
                {
                    Count = pageSize,
                    PageNumber = pageNumber,
                    PagingCookie = pagingCookie
                };

                var retrieveMultipleResponse = service.RetrieveMultiple(query);
                if (retrieveMultipleResponse.Entities.Count > 0)
                {
                    resultCollection.Entities.AddRange(retrieveMultipleResponse.Entities);
                }

                if (retrieveMultipleResponse.MoreRecords)
                {
                    pageNumber++;
                    pagingCookie = retrieveMultipleResponse.PagingCookie;
                }
                else
                {
                    break;
                }
            }

            return resultCollection;
        }

        public static EntityCollection QuerybyAttribute(IOrganizationService service, ITracingService tracingServive, String entityName, ColumnSet columns, String attributeName, String attributeValue)
        {
            QueryByAttribute querybyexpression = new QueryByAttribute(entityName);
            querybyexpression.ColumnSet = columns;
            querybyexpression.Attributes.AddRange(attributeName);
            querybyexpression.Values.AddRange(attributeValue);
            return service.RetrieveMultiple(querybyexpression);
        }

        public static void ExecuteBatchRequest(IOrganizationService service, ITracingService tracingService, OrganizationRequestCollection requestCollection, int split = 50)
        {
            String exceptionMessage = String.Empty;

            List<List<OrganizationRequest>> splittedLists = requestCollection.ToList().ChunkBy(split);
            tracingService.Trace($"Splitted {requestCollection.Count} into {splittedLists.Count} List with split setting of {split}");

            int i = 1;

            foreach (List<OrganizationRequest> listRequests in splittedLists)
            {
                OrganizationRequestCollection newRequestCollection = new OrganizationRequestCollection();
                newRequestCollection.AddRange(listRequests);

                ExecuteMultipleRequest execRequest = new ExecuteMultipleRequest()
                {
                    Settings = new ExecuteMultipleSettings()
                    {
                        ReturnResponses = true,
                        ContinueOnError = false
                    },
                    Requests = newRequestCollection
                };

                try
                {
                    tracingService.Trace($"Execute Multiple Request {i} of {splittedLists.Count}");
                    ExecuteMultipleResponse responseWithResults = (ExecuteMultipleResponse)service.Execute(execRequest);
                    tracingService.Trace($"Multiple Request Executed. Is faulted : {responseWithResults.IsFaulted}");
                    if (responseWithResults.IsFaulted)
                    {
                        foreach (var responseItem in responseWithResults.Responses)
                        {
                            if (responseItem.Fault != null)
                            {
                                Entity dataSourceRecord = (Entity)execRequest.Requests[responseItem.RequestIndex].Parameters["Target"];
                                var message = responseItem.Fault.Message;
                                tracingService.Trace($"Faulted message: {message}");
                            }
                        }
                    }
                    i++;
                }
                catch (Exception ex)
                {
                    tracingService.Trace($"Error {ex}");
                    exceptionMessage += ex.Message;
                }
                finally
                {
                    if (!String.IsNullOrEmpty(exceptionMessage))
                    {
                        tracingService.Trace($"Exception: {exceptionMessage}");
                    }
                }
            }
        }
    }
}
