## Power 365 CRM is a community solution based on Microsoft Dataverse low-code and pro-code.

In this release v1.0 you will be able to manage your entire sales process from Prosect to Quote. This will include management of opportunities during the sales process and autonomous opportunity amount calculation.

### Applies to

[Microsoft Power Apps](https://learn.microsoft.com/en-us/power-apps/)
[Model-Driven Power Apps](https://learn.microsoft.com/en-us/power-apps/maker/model-driven-apps/)
[Custom Pages](https://learn.microsoft.com/en-us/power-apps/maker/model-driven-apps/model-app-page-overview)

### Compatibility

> Don't worry about this section, we'll take care of it. Unless you really want to...

![Power Apps Source File Pack and Unpack Utility 0.20](https://img.shields.io/badge/Packing%20Tool-0.20-green.svg)
![Premium License](https://img.shields.io/badge/Premium%20License-Not%20Required-green.svg "Premium Power Apps license not required")
![Experimental Features](https://img.shields.io/badge/Experimental%20Features-No-green.svg "Does not rely on experimental features")
![On-Premises Connectors](https://img.shields.io/badge/On--Premises%20Connectors-No-green.svg "Does not use on-premise connectors")
![Custom Connectors](https://img.shields.io/badge/Custom%20Connectors-Not%20Required-green.svg "Does not use custom connectors")

### Authors

Solution|Author(s)
--------|---------
Power 365 CRM | [Nicolás Fernández](https://www.linkedin.com/in/nfernandezba/)
Power 365 CRM | [Ignacio Barrios](https://www.linkedin.com/in/ignaciobarriosantos/)
Power 365 CRM | [Wilmer Alcivar](https://www.linkedin.com/in/wilmeralcivar/) - [Github](https://github.com/walcivar)

### Version history

Version|Date|Comments
-------|----|--------
1.0|March 1, 2024|Initial release

### Data Sources

* Dataverse
  
### Data Model

Objects present in the solution:

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

### Installation process

1. Download up-to-date release
2. Install Core solution with common components first
3. Install specific product solution

https://github.com/Power365initiatives/power365crm/releases

### Disclaimer

**THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**
