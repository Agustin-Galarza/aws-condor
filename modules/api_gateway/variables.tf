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

variable "lambdas" {
  description = "The methods of the API Gateway"
  type = list(object({
      path = string
      http_method   = string
      handler       = string
      zip_name      = string
      env_variables = map(any)
      name          = string
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

variable "layers_arns" {
  description = "A list of arns from the layers to attach to the created lambda functions"
  type        = list(string)
}