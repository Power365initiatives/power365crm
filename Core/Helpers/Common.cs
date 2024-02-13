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
        public static T ReturnValueFromAlias<T>(Entity entity, string field)
        {
            if (!entity.Contains(field)) return default(T);
            AliasedValue aliasedValue = entity.GetAttributeValue<AliasedValue>(field);
            if (aliasedValue == null) return default(T);
            return (T)aliasedValue.Value;
        }

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

        public class TracingService : ITracingService
        {
            public void Trace(string format, params object[] args)
            {
                Console.WriteLine(string.Format(format, args));
                System.Diagnostics.Debug.WriteLine(string.Format(format, args));
            }
        }

        public class PluginContext : IPluginExecutionContext
        {
            public Guid BusinessUnitId
            {
                get
                {
                    throw new NotImplementedException();
                }
            }

            public Guid CorrelationId
            {
                get
                {
                    throw new NotImplementedException();
                }
            }

            public int Depth
            {
                get; set;
            }

            public Guid InitiatingUserId
            {
                get; set;
            }

            public ParameterCollection InputParameters
            {
                get; set;
            }

            public bool IsExecutingOffline
            {
                get
                {
                    throw new NotImplementedException();
                }
            }

            public bool IsInTransaction
            {
                get
                {
                    throw new NotImplementedException();
                }
            }

            public bool IsOfflinePlayback
            {
                get
                {
                    throw new NotImplementedException();
                }
            }

            public int IsolationMode
            {
                get
                {
                    throw new NotImplementedException();
                }
            }

            public string MessageName
            {
                get; set;
            }

            public int Mode
            {
                get
                {
                    throw new NotImplementedException();
                }
            }

            public DateTime OperationCreatedOn
            {
                get
                {
                    throw new NotImplementedException();
                }
            }

            public Guid OperationId
            {
                get
                {
                    throw new NotImplementedException();
                }
            }

            public Guid OrganizationId
            {
                get
                {
                    throw new NotImplementedException();
                }
            }

            public string OrganizationName
            {
                get
                {
                    throw new NotImplementedException();
                }
            }

            public ParameterCollection OutputParameters
            {
                get
                {
                    throw new NotImplementedException();
                }
            }

            public EntityReference OwningExtension
            {
                get
                {
                    throw new NotImplementedException();
                }
            }

            public IPluginExecutionContext ParentContext
            {
                get
                {
                    return null;
                }
            }

            public EntityImageCollection PostEntityImages
            {
                get; set;
            }

            public EntityImageCollection PreEntityImages
            {
                get; set;
            }

            public Guid PrimaryEntityId
            {
                get; set;
            }

            public string PrimaryEntityName
            {
                get; set;
            }

            public Guid? RequestId
            {
                get
                {
                    throw new NotImplementedException();
                }
            }

            public string SecondaryEntityName
            {
                get
                {
                    throw new NotImplementedException();
                }
            }

            public ParameterCollection SharedVariables
            {
                get
                {
                    throw new NotImplementedException();
                }
            }

            public int Stage
            {
                get; set;
            }

            public Guid UserId
            {
                get
                {
                    throw new NotImplementedException();
                }
            }
        }        

        public static String GetEnvironmentVariable(IOrganizationService service, ITracingService tracingService, String EnvDefName)
        {
            var fetchXml = $@"<fetch>
                      <entity name='environmentvariabledefinition'>
                        <attribute name='defaultvalue' />
                        <filter type='and'>
                          <condition attribute='schemaname' operator='eq' value='{EnvDefName}'/>
                        </filter>
                        <link-entity name='environmentvariablevalue' from='environmentvariabledefinitionid' to='environmentvariabledefinitionid' link-type='outer' alias='envvarvalue'>
                          <attribute name='value' />
                        </link-entity>
                      </entity>
                    </fetch>";

            Entity result = Common.getDatabyFetchXML(service, fetchXml).Entities.FirstOrDefault();
            String defaultValue = result.GetAttributeValue<String>("defaultvalue");
            String currentValue = Common.ReturnValueFromAlias<String>(result, "envvarvalue.value");
            return !String.IsNullOrEmpty(currentValue) ? currentValue : defaultValue;
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
