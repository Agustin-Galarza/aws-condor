variable "zip_name" {
  description = "The name of the zip file to updload"
  type        = string
  default     = "main.zip"
}

variable "runtime" {
  description = "The runtime environment for the lambdas"
  type        = string
  default     = "nodejs8.10"
}

variable "handler" {
  description = "The handler 'file.method' for the lambda"
  type        = string
  default     = "main.handler"
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
