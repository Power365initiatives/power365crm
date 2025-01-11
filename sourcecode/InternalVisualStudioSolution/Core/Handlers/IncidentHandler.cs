using Microsoft.Crm.Sdk.Messages;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Messages;
using Microsoft.Xrm.Sdk.Query;
using P365I_CRM.Core.Enums;
using System;
using System.Activities.Debugger;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Remoting.Contexts;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Controls;

namespace P365I_CRM.Core.Handlers
{
    public class IncidentHandler
    {
        private readonly ITracingService _tracingService;
        private readonly IOrganizationService _service;
        private OrganizationRequestCollection requestCollection;

        public IncidentHandler(ITracingService tracingService, IOrganizationService service)
        {
            _tracingService = tracingService;
            _service = service;
        }

        public void CloseIncident(Entity incident, string action, string incidentresolution, string ResolutionTypeText, IPluginExecutionContext context)
        {
            _tracingService.Trace("Start CloseIncident");

            requestCollection = new OrganizationRequestCollection();
            var openActivities = GetOpenActivities(incident.ToEntityReference());

            if (action == "Resolve")
            {
                if (openActivities.Entities.Count > 1)
                {
                    CancelOpenActivities(openActivities);
                }

                CreateIncidentResolution(incident.ToEntityReference(), incidentresolution, ResolutionTypeText);

                incident.Attributes["statecode"] = new OptionSetValue((int)IncidentState.Inactive);
                incident.Attributes["statuscode"] = new OptionSetValue((int)IncidentStatus.Resolved);
                requestCollection.Add(new UpdateRequest() { Target = incident });

                context.OutputParameters["CloseIncident_resultMessage"] = "Incident Resolved";
            }
            else //canceling the incident
            {
                CancelOpenActivities(openActivities);
                incident.Attributes["statecode"] = new OptionSetValue((int)IncidentState.Inactive);
                incident.Attributes["statuscode"] = new OptionSetValue((int)IncidentStatus.Canceled);
                requestCollection.Add(new UpdateRequest() { Target = incident });

                context.OutputParameters["CloseIncident_resultMessage"] = "Incident Canceled";
            }

            Helpers.Common.ExecuteBatchRequest(_service, _tracingService, requestCollection);

            _tracingService.Trace("End CloseIncident");
        }

        private EntityCollection GetOpenActivities(EntityReference IncRef)
        {
            _tracingService.Trace("Start GetOpenActivities");

            string fetchXML = $@"<fetch>
                                  <entity name='activitypointer'>
                                    <attribute name='activityid' />
                                    <attribute name='activitytypecode' />
                                    <filter>
                                      <condition attribute='statecode' operator='eq' value='0' />
                                    </filter>
                                    <link-entity name='p365i_incident' from='p365i_incidentid' to='regardingobjectid' alias='incident'>
                                      <filter>
                                        <condition attribute='p365i_incidentid' operator='eq' value='{IncRef.Id}' />
                                      </filter>
                                    </link-entity>
                                  </entity>
                                </fetch>";

            _tracingService.Trace("End GetOpenActivities");
            return Helpers.Common.getDatabyFetchXML(_service, fetchXML);
        }

        private void CancelOpenActivities(EntityCollection openActivities)
        {
            _tracingService.Trace("Start CancelOpenActivities");

            foreach (var activity in openActivities.Entities)
            {
                _tracingService.Trace($"Processing activity with ID: {activity.Id}");

                // Retrieve the full activitypointer record to get ActivityTypeCode
                /*Entity activityPointer = _service.Retrieve("activitypointer", activity.Id, new ColumnSet("activitytypecode"));
                _tracingService.Trace($"Retrieved activitypointer with ID: {activityPointer.Id}");*/

                // Get the specific activity logical name
                string specificLogicalName = GetActivityLogicalName(activity);

                if (string.IsNullOrEmpty(specificLogicalName))
                {
                    _tracingService.Trace($"Skipping activity with ID: {activity.Id} as its type is not supported.");
                    continue;
                }

                // Create the specific activity entity for update
                Entity specificActivity = new Entity(specificLogicalName, activity.Id)
                {
                    ["statecode"] = new OptionSetValue((int)ActivityState.Canceled),
                };

                // Set the statuscode based on the specificLogicalName
                switch (specificLogicalName)
                {
                    case "task":
                        specificActivity["statuscode"] = new OptionSetValue((int)TaskActivityStatus.Canceled);
                        break;

                    case "phonecall":
                        specificActivity["statuscode"] = new OptionSetValue((int)PhoneStatus.Canceled);
                        break;

                    case "email":
                        specificActivity["statuscode"] = new OptionSetValue((int)EmailStatus.Canceled);
                        break;

                    case "appointment":
                        specificActivity["statuscode"] = new OptionSetValue((int)AppointmentStatus.Canceled);
                        break;
                }

                requestCollection.Add(new UpdateRequest { Target = specificActivity });
            }

            _tracingService.Trace("End CancelOpenActivities");
        }

        private string GetActivityLogicalName(Entity activityPointer)
        {
            if (!activityPointer.Attributes.Contains("activitytypecode"))
            {
                _tracingService.Trace($"ActivityTypeCode not found for activity ID: {activityPointer.Id}");
                return null;
            }

            // Retrieve activitytypecode as a string, which directly represents the logical name
            string activityLogicalName = activityPointer.GetAttributeValue<string>("activitytypecode");

            if (string.IsNullOrEmpty(activityLogicalName))
            {
                _tracingService.Trace($"Invalid or empty ActivityTypeCode for activity ID: {activityPointer.Id}");
                return null;
            }

            _tracingService.Trace($"ActivityTypeCode '{activityLogicalName}' retrieved for activity ID: {activityPointer.Id}");
            return activityLogicalName;
        }

        private void CreateIncidentResolution(EntityReference incRef, string incidentresolution, string ResolutionTypeText)
        {
            _tracingService.Trace("Start CreateIncidentResolution");

            Entity incidentResolution = new Entity("p365i_incidentresolution");
            incidentResolution["p365i_incident"] = incRef;
            incidentResolution["p365i_resolution"] = incidentresolution;

            if(ResolutionTypeText == "Problem Solved")
                incidentResolution["p365i_resolutiontype"] = new OptionSetValue((int)ResolutionType.ProblemSolved);
            else if (ResolutionTypeText == "Information Provided")
                incidentResolution["p365i_resolutiontype"] = new OptionSetValue((int)ResolutionType.InformationProvided);

            requestCollection.Add(new CreateRequest() { Target = incidentResolution });
            _tracingService.Trace("End CreateIncidentResolution");
        }
    }
}
