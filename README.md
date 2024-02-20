## Power 365 CRM is a community solution based on Microsoft Dataverse low-code and pro-code.

In this release you will be able to manage your entire sales process from Prosect to Quote. This will include management of opportunities during the sales process and autonomous opportunity amount calculation.
Objects present in the solution:

### Data Model

  Type | Tables |
|-----:|-----------|
| Common | Account, Contact, Currency |
| Core | List Item, Price List, Product, Sales Unit |
| Sales | Lead, Opportunity, Opportunity Product, Quote, Quote Product, Account Plan, Action Plan, Opportunity Closure |


<details>
<summary>Development</summary>

| Rank | Languages |
|-----:|-----------|
|WebResources| JavaScript|
|Custom APIs| CloseOpportunity, CreateQuoteFromOpp, QualifyProspect |
|Plugins| OpportunityPostOp, OpportunityProductPostOp, QUoteProductPostOp |

</details>

### Release

1. Download up-to-date release
2. Install Core solution with common components first
3. Install specific product solution

https://github.com/Power365initiatives/power365crm/releases
