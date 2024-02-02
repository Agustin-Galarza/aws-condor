output "zz_frontend_files" {
  value = local.file_with_type
}

# output "zz_build_message" {
#   value = data.external.npm_build.result.message
# }

output "vpc_id" {
  description = "The ID of the VPC"
  value       = module.vpc.vpc_id
}

output "vpc_arn" {
  description = "The ARN of the VPC"
  value       = module.vpc.vpc_arn
}

output "vpc_cidr" {
  description = "The CIDR block of the VPC"
  value       = module.vpc.vpc_cidr_block
}

output "vpc_database_subnets" {
  description = "The IDs of the VPC database subnets"
  value       = module.vpc.database_subnets
}

output "application_subnets" {
  description = "The IDs of the private subnets"
  value       = module.vpc.private_subnets
}

output "database_subnets" {
  description = "The IDs of the database subnets"
  value       = module.vpc.database_subnets
}

output "vpc_endpoints_id" {
  description = "The IDs of the VPC endpoints"
  value       = [for key, value in module.vpc_endpoints : value]
}

output "sns" {
  value       = module.sns
  description = "SNS"
}

output "zz_cognito_client_id" {
  value       = module.cognito.user_pool_client_id
  description = "Cognito Client ID"
}
output "zz_cognito_userpool_id" {
  value       = module.cognito.user_pool_id
  description = "Cognito Client ID"
}

output "lab_role_arn" {
  value = data.aws_iam_role.lab_role.arn
}

output "application_security_group_id" {
  value = module.application_security_group.id
}

output "zz_cloudfront_domain_name" {
  value = module.cloudfront.cloudfront_domain_name
}

output "api_invoke_url" {
  value = module.api_gateway.api_gateway_invoke_url
}

output "frontend_upload" {
  value = aws_s3_object.data
}
