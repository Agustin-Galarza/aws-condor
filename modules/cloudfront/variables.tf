variable "website_bucket_regional_domain_name" {
  description = "Domain name of the S3 bucket"
  type        = string
}

variable "s3_bucket_id" {
  description = "target domain name of the S3 bucket"
  type        = string
}

variable "aliases" {
  type = set(string)
}

variable "certificate_arn" {
  description = "Certificate ARN"
  type        = string
  default     = null
}

variable "api_gw_id" {
  description = "API Gateway ID"
  type        = string
}

variable "region" {
  description = "AWS Region"
  type        = string
}

variable "api_gw_stage" {
  description = "Stage"
  type        = string
}
