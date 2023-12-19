variable "cognito_arn" {
  description = "The ARN of the Cognito User Pool"
  type        = string
}

variable "name" {
  description = "The name of the API Gateway"
  type        = string
}

variable "stage" {
  description = "The stage of the API Gateway"
  type        = string
}

variable "authorizer" {
  description = "The authorizer of the API Gateway { name, type }"
  type        = map(any)
}

variable "account_id" {
  type        = string
  description = "Account id"
}

variable "methods" {
  description = "The methods of the API Gateway"
  type = list(object({
    path = string
    methods = list(object({
      http_method   = string
      handler       = string
      zip_name      = string
      env_variables = map(any)
      name          = string
    }))
  }))
}

variable "tags" {
  description = "The tags of the API Gateway"
  type        = map(any)
  default     = {}
}

variable "role_arn" {
  description = "Role ARN to use for the lambda functions"
  type        = string
}
