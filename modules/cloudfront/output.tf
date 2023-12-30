output "cloudfront_distribution" {
  description = "The cloudfront distribution for the deployment"
  value       = aws_cloudfront_distribution.this
}

output "cloudfront_domain_name" {
  description = "The domain name of the cloudfront distribution"
  value       = aws_cloudfront_distribution.this.domain_name
}
