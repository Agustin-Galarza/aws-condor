 resource "aws_s3_bucket" "this" {
   bucket              = var.name
 }

 resource "aws_s3_bucket_logging" "this" {
   bucket        = var.bucket_to_log
   target_bucket = aws_s3_bucket.this.id
   target_prefix = "condor-logs/"
 }
