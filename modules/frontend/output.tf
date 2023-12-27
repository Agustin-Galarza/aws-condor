# output "frontend_endpoint" {
#   value = aws_s3_bucket_website_configuration.frontend.website_endpoint
# }


# output "www_endpoint" {
#   value = aws_s3_bucket_website_configuration.www.website_endpoint
# }

# output "frontend_bucket" {
#   value = module.frontend.id
# }

# output "www_bucket" {
#   value = module.www.id
# }

# output "frontend_bucket_name" {
#   value = module.frontend.bucket
# }

# output "www_bucket_name" {
#   value = module.www.bucket
# }

# output "frontend_bucket_domain_name" {
#   value = module.frontend.bucket_regional_domain_name
# }

# output "www_bucket_domain_name" {
#   value = module.www.bucket_regional_domain_name
# }


# output "frontend_bucket_arn" {
#   value = module.frontend.arn
# }

# output "www_bucket_arn" {
#   value = module.www.arn
# }


# output "frontend_bucket_rdn" {
#   value = module.frontend.bucket_regional_domain_name
# }

# output "www_bucket_rdn" {
#   value = module.www.bucket_regional_domain_name
# }
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
