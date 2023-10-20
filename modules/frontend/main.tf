# // condor.com bucket
# resource "aws_s3_bucket" "frontend" {
#   bucket              = var.frontend_name
# #  object_lock_enabled = true
#   force_destroy       = true


#   tags = {
#     type = "frontend"
#   }
# }

# data "aws_iam_policy_document" "frontend" {
#   statement {
#     sid       = "AllowPublicRead"
#     actions   = ["s3:GetObject"]
#     resources = ["${aws_s3_bucket.frontend.arn}/*"]
#     principals {
#       type        = "AWS"
#       identifiers = ["*"]
#     }
#   }
# }



# #resource "aws_s3_bucket_policy" "frontend" {
# #  bucket = aws_s3_bucket.frontend.id
# #
# #  policy = data.aws_iam_policy_document.frontend.json
# #}

# resource "aws_s3_object" "frontend" {
#   for_each = { for file in local.file_with_type : file.name => file }

#   bucket        = aws_s3_bucket.frontend.id
#   key           = each.value.name
#   source        = "${var.frontend_folder}/${each.value.name}"
#   etag          = filemd5("${var.frontend_folder}/${each.value.name}")
#   content_type  = each.value.type
#   storage_class = "STANDARD" // TODO: Podria ser STANDARD_IA
# }

# #resource "aws_s3_bucket_ownership_controls" "frontend" {
# #  bucket = aws_s3_bucket.frontend.id
# #  rule {
# #    object_ownership = "BucketOwnerPreferred"
# #  }
# #}
# #
# #resource "aws_s3_bucket_public_access_block" "frontend" {
# #  bucket = aws_s3_bucket.frontend.id
# #
# #  block_public_acls       = false
# #  block_public_policy     = false
# #  ignore_public_acls      = false
# #  restrict_public_buckets = false
# #}
# #
# #resource "aws_s3_bucket_acl" "frontend" {
# #  bucket = aws_s3_bucket.frontend.id
# #  acl    = "public-read" //TODO: Change to private
# #
# #  depends_on = [
# #    aws_s3_bucket_ownership_controls.frontend,
# #    aws_s3_bucket_public_access_block.frontend,
# #  ]
# #}

# resource "aws_s3_bucket_website_configuration" "frontend" {
#   bucket = aws_s3_bucket.frontend.id

#   index_document {
#     suffix = "index.html"
#   }

#   error_document {
#     key = "index.html"
#   }
# }

# # resource "aws_s3_bucket_replication_configuration" "frontend" {} TODO: Investigar esto


# resource "aws_s3_bucket_server_side_encryption_configuration" "frontend" {
#   bucket = aws_s3_bucket.frontend.id

#   rule {
#     apply_server_side_encryption_by_default {
#       sse_algorithm = "AES256"
#     }
#   }
# }

# // www.condor.com bucket
# resource "aws_s3_bucket" "www" {
#   bucket              = local.www_frontend_bucket_name
# #  object_lock_enabled = true
#   force_destroy       = true

#   tags = {
#     type = "frontend"
#   }
# }
# data "aws_iam_policy_document" "www" {
#   statement {
#     sid       = "AllowPublicRead"
#     actions   = ["s3:GetObject"]
#     resources = ["${aws_s3_bucket.www.arn}/*"]
#     principals {
#       type        = "AWS"
#       identifiers = ["*"]
#     }
#   }
# }

# resource "aws_s3_bucket_website_configuration" "www" {
#   bucket = aws_s3_bucket.www.id

#   redirect_all_requests_to {
#     host_name = aws_s3_bucket.frontend.bucket_domain_name
#   }
# }

# #resource "aws_s3_bucket_ownership_controls" "www" {
# #  bucket = aws_s3_bucket.www.id
# #  rule {
# #    object_ownership = "BucketOwnerPreferred"
# #  }
# #}
# #
# #resource "aws_s3_bucket_acl" "www" {
# #  bucket = aws_s3_bucket.www.id
# #  acl    = "private"
# #}

# resource "aws_s3_bucket_server_side_encryption_configuration" "www" {
#   bucket = aws_s3_bucket.www.id

#   rule {
#     apply_server_side_encryption_by_default {
#       sse_algorithm = "AES256"
#     }
#   }
# }
# #resource "aws_s3_bucket_policy" "www" {
# #  bucket = aws_s3_bucket.www.id
# #
# #  policy = data.aws_iam_policy_document.www.json
# #}

