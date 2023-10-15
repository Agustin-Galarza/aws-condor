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

output "private_subnets" {
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

output "cognito_client_id" {
  value       = module.cognito.user_pool_client_id
  description = "Cognito Client ID"
}
