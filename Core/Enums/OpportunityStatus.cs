using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace P365I_CRM.Core.Enums
{
    public enum OpportunityStatus
    {
        InProgress = 1,
        OnHold = 446310001,
        Won = 2,
        Lost = 446310002,
        Canceled = 446310003
    }

    public enum OpportunityState
    {
        Active = 0,
        Inactive = 1
    }
}
