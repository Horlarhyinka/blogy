import mongoose from "mongoose"

export enum categories {politics="politics", sport = "sport", business = "business", education = "education", technology="technology"}

export const isValidId = (id: string)=>mongoose.Types.ObjectId.isValid(id)

export enum mail_types {
    PASSWORD_RESET_TOKEN = "PASSWORD_RESET_TOKEN",
    ONBOARDING = "ONBOARDING",
    PASSWORD_RESET_CONFIRMATION = "PASSWORD_RESET_CONFIRMATION",
    NEW_BLOG_NOTIFICATION = "NEW_BLOG_NOTIFICATION",
    NEWSLETTER_CONFIRMATION = "NEWSLETTER_CONFIRMATION",
    
}

export const errorMessages = {
    authorization_failed: ()=>`authorization failed`,
    service_unavailable: (serviceName?: string)=>`${serviceName || ""} service is temporarily unavailable`,
    action_failed: (actionName: string)=>`${actionName} failed`,
    resource_not_found: (resourceName: string)=>`${resourceName} not found.`,
    invalid_field: (fieldName: string)=>`invalid ${fieldName}`
}