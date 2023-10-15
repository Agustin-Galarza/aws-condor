variable "runtime" {
  description = "The runtime environment for the lambdas"
  type        = string
  default     = "nodejs18.x"
}

variable "handler" {
  description = "The handler 'file.method' for the lambda"
  type        = string
}

variable "function_name" {
  description = "A name for the lambda"
  type        = string
  default     = "handler"
}

variable "apigw_arn" {
  description = "The arn of the related API Gateway"
  type        = string
}

variable "endpoint" {
  description = "The information about the endpoint associated with this lambda. The method field should be all uppercase ('GET', 'POST') and the path MUST contain the starting '/'"
  type = object({
    path = string
    method = string
  })
}

variable "env_variables" {
  description = "A map containing all the environment variables for the lambda"
  type        = map(string)
}
