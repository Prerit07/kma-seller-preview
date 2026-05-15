import { COMMERCIAL_PROPERTY_TYPE, CONSTRUCTION_STATUS, FLOORING_STATUS, LIST_TYPE, OWNERSHIP, POSSESION_STATUS, PROPERTY_CATEGORY, PROPERTY_CONDITION, RESIDENTIAL_PROPERTY_TYPE, USER_TYPE, ZONE_TYPE } from "@/lib/enums";

export type UserType = typeof USER_TYPE[keyof typeof USER_TYPE];

export type ListType = typeof LIST_TYPE[keyof typeof LIST_TYPE];

export type PropertyCategory = typeof PROPERTY_CATEGORY[keyof typeof PROPERTY_CATEGORY];

export type PossesionStatus = typeof POSSESION_STATUS[keyof typeof POSSESION_STATUS];

export type ResidentialPropertyType = typeof RESIDENTIAL_PROPERTY_TYPE[keyof typeof RESIDENTIAL_PROPERTY_TYPE];

export type CommercialPropertyType = typeof COMMERCIAL_PROPERTY_TYPE[keyof typeof COMMERCIAL_PROPERTY_TYPE];

export type ZoneType = typeof ZONE_TYPE[keyof typeof ZONE_TYPE];

export type propertyCondition = typeof PROPERTY_CONDITION[keyof typeof PROPERTY_CONDITION];

export type ownerShip = typeof OWNERSHIP[keyof typeof OWNERSHIP]

export type constructionStatus = typeof CONSTRUCTION_STATUS[keyof typeof CONSTRUCTION_STATUS]

export type flooringStatus = typeof FLOORING_STATUS[keyof typeof FLOORING_STATUS]
