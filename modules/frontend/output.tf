 output "frontend_endpoint" {
   value = aws_s3_bucket_website_configuration.frontend.website_endpoint
 }

 output "www_endpoint" {
   value = aws_s3_bucket_website_configuration.www.website_endpoint
 }

 output "frontend_bucket" {
   value = aws_s3_bucket.frontend.id
 }

 output "www_bucket" {
   value = aws_s3_bucket.www.id
 }

 output "frontend_bucket_name" {
   value = aws_s3_bucket.frontend.bucket
 }

 output "www_bucket_name" {
   value = aws_s3_bucket.www.bucket
 }

 output "frontend_bucket_domain_name" {
   value = aws_s3_bucket.frontend.bucket_regional_domain_name
 }

 output "www_bucket_domain_name" {
   value = aws_s3_bucket.www.bucket_regional_domain_name
 }
