
output "frontend_endpoint" {
  value = module.frontend.s3_bucket_website_endpoint
}

output "frontend_domain_name" {
  value = module.frontend.s3_bucket_website_domain
}

output "frontend_bucket" {
  value = module.frontend.s3_bucket_id
}

output "frontend_bucket_rdn" {
  value = module.frontend.s3_bucket_bucket_regional_domain_name
}

output "frontend_bucket_arn" {
  description = "frontend bucket ARN"
  value       = module.frontend.s3_bucket_arn
}
output "www_bucket_rdn" {
  description = "frontend bucket regional domain name"
  value       = module.www.s3_bucket_bucket_regional_domain_name
}
