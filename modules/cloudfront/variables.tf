variable "static_website" {
  description = "Configuration for the static website hosting"
  type = object({
    id                  = string
    domain_name         = string
    bucket_arn          = string
    default_root_object = string
  })
}

variable "api_gw" {
  description = "API Gateway to connect to this cloudfront"
  type = object({
    id         = string
    stage      = string
    invoke_url = string
  })
}

variable "aliases" {
  description = "Aliases"
  type        = list(string)
  default     = []
}

variable "certificate_arn" {
  description = "Certificate ARN"
  type        = string
  default     = null
}
variable "region" {
  description = "AWS Region"
  type        = string
}

variable "frontend_folder" {
  type = string
}
