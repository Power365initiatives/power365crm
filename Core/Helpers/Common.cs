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
        public static String CallFlow(string endpoint, object body, string errorMessage)
        {
            var task = ExecuteCallFlow(
                endpoint,
                body,
                errorMessage
                );
            task.Wait();
            return task.Result;
        }

        internal static async Task<String> ExecuteCallFlow(string endpoint, object body, string errorMessage)
        {
            var client = new HttpClient();
            var request = new HttpRequestMessage(HttpMethod.Post, endpoint);

            var content = new StringContent(Common.JsonSerialize(body), null, "application/json");

            request.Content = content;
            var response = await client.SendAsync(request);
            var result = await response.Content.ReadAsStringAsync();

            response.EnsureSuccessStatusCode();

            return result;
        }

        public static void CheckForStringEmpty(string input, string description)
        {
            if (string.IsNullOrWhiteSpace(input))
            {
                throw new InvalidPluginExecutionException($"{description} not filled");
            }
        }

        public static void CheckForAttributeEmpty(dynamic input, string description)
        {
            if (input == null)
            {
                throw new InvalidPluginExecutionException($"{description} not filled");
            }
        }

        public static void setStatus(IOrganizationService service, EntityReference Target, int? statecode, int? statuscode)
        {
            Entity updateEntity = new Entity(Target.LogicalName, Target.Id);
            if (statecode.HasValue) { updateEntity.Attributes.Add("statecode", new OptionSetValue(statecode.Value)); }
            if (statuscode.HasValue) { updateEntity.Attributes.Add("statuscode", new OptionSetValue(statuscode.Value)); }
            if (updateEntity.Attributes.Count > 0) { service.Update(updateEntity); }
        }

        public static T ReturnValueFromAlias<T>(Entity entity, string field)
        {
            if (!entity.Contains(field)) return default(T);
            AliasedValue aliasedValue = entity.GetAttributeValue<AliasedValue>(field);
            if (aliasedValue == null) return default(T);
            return (T)aliasedValue.Value;
        }

        public static T SelectTargetOrImage<T>(Entity target, Entity image, string attr)
        {

            if (image != null && !target.Contains(attr))
            {
                if (image.Contains(attr))
                {
                    return image.GetAttributeValue<T>(attr);
                }
                else
                {
                    return default(T);
                }
            }
            else
            {
                return target.GetAttributeValue<T>(attr);
            }
        }

        public static String JsonSerialize(object input)
        {
            return JsonConvert.SerializeObject(input,
                new JsonSerializerSettings()
                {
                    NullValueHandling = NullValueHandling.Ignore,
                    DateFormatHandling = DateFormatHandling.IsoDateFormat,
                    DefaultValueHandling = DefaultValueHandling.Ignore,
                    DateFormatString = "yyyy-MM-dd"
                }
            );
        }

        public static String JsonIndentFour(object input)
        {
            return JsonConvert.SerializeObject(input,
                new JsonSerializerSettings()
                {
                    Formatting = Newtonsoft.Json.Formatting.Indented,

                    NullValueHandling = NullValueHandling.Ignore,
                    DateFormatHandling = DateFormatHandling.IsoDateFormat,
                    DefaultValueHandling = DefaultValueHandling.Ignore,
                }
            );
        }

        public static T JsonDeSerialize<T>(String JSON)
        {
            return JsonConvert.DeserializeObject<T>(JSON,
                new JsonSerializerSettings()
                {
                    NullValueHandling = NullValueHandling.Ignore,
                    DateFormatHandling = DateFormatHandling.IsoDateFormat,
                    DefaultValueHandling = DefaultValueHandling.Ignore,
                }
            );
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

        public static EntityCollection GetDatabyQueryExpression(IOrganizationService service, QueryExpression query)
        {
            EntityCollection resultCollection = new EntityCollection();

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

        public class WorkflowContext : IWorkflowContext
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
                get
                {
                    throw new NotImplementedException();
                }
            }

            public Guid InitiatingUserId
            {
                get
                {
                    throw new NotImplementedException();
                }
            }

            public ParameterCollection InputParameters
            {
                get
                {
                    throw new NotImplementedException();
                }
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
                get
                {
                    throw new NotImplementedException();
                }
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

            public IWorkflowContext ParentContext
            {
                get
                {
                    throw new NotImplementedException();
                }
            }

            public EntityImageCollection PostEntityImages
            {
                get
                {
                    throw new NotImplementedException();
                }
            }

            public EntityImageCollection PreEntityImages
            {
                get
                {
                    throw new NotImplementedException();
                }
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

            public string StageName
            {
                get
                {
                    throw new NotImplementedException();
                }
            }

            public Guid UserId
            {
                get
                {
                    throw new NotImplementedException();
                }
            }

            public int WorkflowCategory
            {
                get
                {
                    throw new NotImplementedException();
                }
            }

            public int WorkflowMode
            {
                get
                {
                    throw new NotImplementedException();
                }
            }
        }

        public static void TraceEntityData(Entity target, ITracingService tracingService)
        {
            tracingService.Trace($"Entity {target.LogicalName} contains {target.Attributes.Count} Attributes");
            tracingService.Trace($"Entity {target.LogicalName} contains {target.FormattedValues.Count} Formatted Values");

            int linenumberAtt = 0;

            foreach (var attribute in target.Attributes)
            {
                linenumberAtt++;
                tracingService.Trace($"{linenumberAtt} | Attribute Key : {attribute.Key} and Attribute Value : {attribute.Value}");
            }

            int linenumberFormatted = 0;

            foreach (var formattedValue in target.FormattedValues)
            {
                linenumberFormatted++;
                tracingService.Trace($"{linenumberFormatted} | Formatted Key : {formattedValue.Key} and Formatted Value : {formattedValue.Value}");
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

        public static DateTime ConvertCrmDateToUserDate(DateTime inputDate, TimeZoneInfo userTimeZone)
        {
            return TimeZoneInfo.ConvertTimeFromUtc(inputDate, userTimeZone);
        }

        public static TimeZoneInfo GetUserTimeZone(IOrganizationService service, Guid userGuid)
        {
            //replace userid with id of user
            Entity userSettings = service.Retrieve("usersettings", userGuid, new ColumnSet("timezonecode"));
            //timezonecode for UTC is 85
            int timeZoneCode = 85;

            //retrieving timezonecode from usersetting
            if ((userSettings != null) && (userSettings["timezonecode"] != null))
            {
                timeZoneCode = (int)userSettings["timezonecode"];
            }
            //retrieving standard name
            var qe = new QueryExpression("timezonedefinition");
            qe.ColumnSet = new ColumnSet("standardname");
            qe.Criteria.AddCondition("timezonecode", ConditionOperator.Equal, timeZoneCode);
            EntityCollection TimeZoneDef = service.RetrieveMultiple(qe);

            TimeZoneInfo userTimeZone = null;
            if (TimeZoneDef.Entities.Count == 1)
            {
                String timezonename = TimeZoneDef.Entities[0]["standardname"].ToString();
                userTimeZone = TimeZoneInfo.FindSystemTimeZoneById(timezonename);
            }
            return userTimeZone;
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

        public static void UploadFileToColumn(IOrganizationService service, ITracingService tracingService, String fileName, String attributeLogicalName, EntityReference targetRef, byte[] fileData)
        {
            tracingService.Trace("Start Upload File");

            InitializeFileBlocksUploadRequest initializeFileBlocksUploadRequest = new InitializeFileBlocksUploadRequest()
            {
                FileAttributeName = attributeLogicalName,
                Target = targetRef,
                FileName = fileName
            };

            try
            {
                var uploadResponse = (InitializeFileBlocksUploadResponse)service.Execute(initializeFileBlocksUploadRequest);

                const int blockSize = 4194304; // 4 MB Max per block
                int byteCount;
                var blockList = new List<string>();
                Stream stream = new MemoryStream(fileData);

                do
                {
                    var buffer = new byte[blockSize];
                    byteCount = stream.Read(buffer, 0, blockSize);

                    if (byteCount < blockSize)
                        Array.Resize(ref buffer, byteCount);

                    var uploadRequest = new UploadBlockRequest
                    {
                        BlockData = buffer,
                        BlockId = Convert.ToBase64String(Encoding.UTF8.GetBytes(Guid.NewGuid().ToString("N"))),
                        FileContinuationToken = uploadResponse.FileContinuationToken
                    };

                    service.Execute(uploadRequest);
                    blockList.Add(uploadRequest.BlockId);
                }
                while (byteCount == blockSize);

                var commitRequest = new CommitFileBlocksUploadRequest
                {
                    BlockList = blockList.ToArray(),
                    FileContinuationToken = uploadResponse.FileContinuationToken,
                    FileName = initializeFileBlocksUploadRequest.FileName,
                    MimeType = "text/xml"
                };

                var commitResponse = (CommitFileBlocksUploadResponse)service.Execute(commitRequest);
            }
            catch (Exception ex)
            {
                tracingService.Trace(ex.Message);
                throw ex;
            }
            tracingService.Trace("End Upload File");
        }
        public static string sGetEntityNameFromCode(string ObjectTypeCode, IOrganizationService service)
        {
            MetadataFilterExpression entityFilter = new MetadataFilterExpression(LogicalOperator.And);
            entityFilter.Conditions.Add(new MetadataConditionExpression("ObjectTypeCode", MetadataConditionOperator.Equals, Convert.ToInt32(ObjectTypeCode)));
            EntityQueryExpression entityQueryExpression = new EntityQueryExpression()
            {
                Criteria = entityFilter
            };
            RetrieveMetadataChangesRequest retrieveMetadataChangesRequest = new RetrieveMetadataChangesRequest()
            {
                Query = entityQueryExpression,
                ClientVersionStamp = null
            };
            RetrieveMetadataChangesResponse response = (RetrieveMetadataChangesResponse)service.Execute(retrieveMetadataChangesRequest);

            EntityMetadata entityMetadata = (EntityMetadata)response.EntityMetadata[0];
            return entityMetadata.SchemaName.ToLower();
        }

    }
}
