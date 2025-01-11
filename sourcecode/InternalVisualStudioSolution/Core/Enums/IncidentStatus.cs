using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace P365I_CRM.Core.Enums
{
    public enum IncidentStatus
    {
        InProgress = 1,
        OnHold = 446310001,
        WaitingForDetails = 446310002,
        Researching = 446310003,
        Inactive = 2,
        Resolved = 446310004,
        Canceled = 446310005
    }

    public enum IncidentState
    {
        Active = 0,
        Inactive = 1
    }
}
