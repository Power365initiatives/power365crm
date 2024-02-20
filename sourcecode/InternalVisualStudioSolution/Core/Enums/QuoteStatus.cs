using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace P365I_CRM.Core.Enums
{
    public enum QuoteStatus
    {
        Draft = 1,
        Presented = 446310003,
        Accepted = 2,
        Rejected = 446310001,
        Canceled = 446310002
    }

    public enum QuoteState
    {
        Active = 0,
        Inactive = 1
    }
}
