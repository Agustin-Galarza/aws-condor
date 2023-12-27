# // Logs
# module "logs" {
#   source        = "terraform-aws-modules/s3-bucket/aws"
#   bucket_prefix = local.logs_bucket_name
#   acl           = "log-delivery-write"

#   force_destroy = true

#   attach_deny_insecure_transport_policy = true
#   attach_require_latest_tls_policy      = true

#   control_object_ownership = true
#   object_ownership         = "ObjectWriter"
# }

# // Reports
# module "reports" {
#   source        = "terraform-aws-modules/s3-bucket/aws"
#   bucket_prefix = local.reports_bucket_name
#   acl           = "private"

#   force_destroy = true

#   server_side_encryption_configuration = {
#     rule = {
#       apply_server_side_encryption_by_default = {
#         sse_algorithm = "AES256"
#       }
#     }
#   }

#   # cors_rule = { // TODO: Check if this is correct
#   #   allowed_headers = ["*"]
#   #   allowed_methods = ["GET", "PUT", "POST", "DELETE", "HEAD"]
#   #   allowed_origins = ["*"]
#   #   expose_headers  = ["ETag"]
#   #   max_age_seconds = 3000
#   # }

#   attach_deny_insecure_transport_policy = true
#   attach_require_latest_tls_policy      = true

#   control_object_ownership = true
#   object_ownership         = "ObjectWriter"

#   tags = {
#     type = "reports"
#   }
# }

# # resource "aws_s3_bucket_policy" "OAI_policy" {
# #   bucket = var.s3_object_id
# #   policy = data.aws_iam_policy_document.frontend_OAI_policy.json
# # }

# module "frontend" {
#   source        = "terraform-aws-modules/s3-bucket/aws"
#   bucket_prefix = var.frontend_name
#   acl           = "private"

#   force_destroy = true

#   server_side_encryption_configuration = {
#     rule = {
#       apply_server_side_encryption_by_default = {
#         sse_algorithm = "AES256"
#       }
#     }
#   }

#   attach_deny_insecure_transport_policy = true
#   attach_require_latest_tls_policy      = true

#   control_object_ownership = true
#   object_ownership         = "BucketOwnerPreferred"

#   tags = {
#     type = "frontend"
#   }
# }


# resource "aws_s3_object" "frontend" {
#   for_each = { for file in local.file_with_type : file.name => file }

#   bucket        = module.frontend.s3_object_id
#   key           = each.value.name
#   source        = "${var.frontend_folder}/${each.value.name}"
#   etag          = filemd5("${var.frontend_folder}/${each.value.name}")
#   content_type  = each.value.type
#   storage_class = "STANDARD"
# }

# resource "aws_s3_bucket_website_configuration" "frontend" {
#   bucket = module.frontend.s3_object_id

#   index_document {
#     suffix = "index.html"
#   }

#   error_document {
#     key = "index.html"
#   }
# }

# resource "aws_s3_bucket_public_access_block" "frontend" {
#   bucket = module.frontend.s3_object_id

#   block_public_acls       = true
#   block_public_policy     = true
#   ignore_public_acls      = true
#   restrict_public_buckets = true
# }


# module "www" {
#   source        = "terraform-aws-modules/s3-bucket/aws"
#   bucket_prefix = local.www_frontend_bucket_name
#   acl           = "private"

#   force_destroy = true

#   server_side_encryption_configuration = {
#     rule = {
#       apply_server_side_encryption_by_default = {
#         sse_algorithm = "AES256"
#       }
#     }
#   }

#   attach_deny_insecure_transport_policy = true
#   attach_require_latest_tls_policy      = true

#   control_object_ownership = true
#   object_ownership         = "BucketOwnerPreferred"

#   tags = {
#     type = "frontend"
#   }
# }

# // www.condor.com bucket
# resource "aws_s3_bucket_logging" "www" {
#   bucket = module.www.id

#   target_bucket = module.logs.s3_object_id
#   target_prefix = "log/"
# }

# resource "aws_s3_bucket_website_configuration" "www" {
#   bucket = module.www.s3_object_id

#   redirect_all_requests_to {
#     host_name = module.frontend.bucket_domain_name
#   }
# }

# resource "aws_s3_bucket_public_access_block" "www" {
#   bucket = module.www.s3_object_id

#   block_public_acls       = true
#   block_public_policy     = true
#   ignore_public_acls      = true
#   restrict_public_buckets = true
# }




//// --------------------------------- NEW ---------------------------------


module "reports" {
  source        = "terraform-aws-modules/s3-bucket/aws"
  bucket_prefix = "reports-"

  force_destroy = true

  server_side_encryption_configuration = {
    rule = {
      apply_server_side_encryption_by_default = {
        sse_algorithm = "AES256"
      }
    }
  }

  attach_deny_insecure_transport_policy = true
  attach_require_latest_tls_policy      = true

  control_object_ownership = true
  object_ownership         = "ObjectWriter"

  tags = {
    type = "reports"
  }
}

module "frontend" {

  force_destroy = true
  source        = "terraform-aws-modules/s3-bucket/aws"
  bucket_prefix = "frontend-"


  server_side_encryption_configuration = {
    rule = {
      apply_server_side_encryption_by_default = {
        sse_algorithm = "AES256"
      }
    }
  }

  website = {
    index_document = "index.html"
  }

  logging = {
    target_bucket = module.logs.s3_bucket_id
    target_prefix = "logs/"
  }
}

module "logs" {
  source = "terraform-aws-modules/s3-bucket/aws"


  bucket_prefix = "logs-"
  force_destroy = true

  attach_deny_insecure_transport_policy = true
  attach_require_latest_tls_policy      = true
  server_side_encryption_configuration = {
    rule = {
      apply_server_side_encryption_by_default = {
        sse_algorithm = "AES256"
      }
    }
  }

}

module "www" {
  source = "terraform-aws-modules/s3-bucket/aws"

  bucket_prefix = "www-"
  force_destroy = true

  website = {
    redirect_all_requests_to = {
      host_name = module.frontend.s3_bucket_bucket_regional_domain_name
    }
  }
}

resource "aws_s3_object" "data" {
  for_each = { for file in local.file_with_type : file.name => file }

  bucket        = module.frontend.s3_bucket_id
  key           = each.value.name
  source        = "${var.frontend_folder}/${each.value.name}"
  etag          = filemd5("${var.frontend_folder}/${each.value.name}")
  content_type  = each.value.type
  storage_class = "STANDARD"
}

# resource "aws_s3_object" "data" {
#   for_each = { for file in local.file_with_type : file.dest => file }

#   bucket = module.frontend.s3_bucket_id

#   key          = each.value.dest
#   source       = each.value.source
#   content_type = each.value.content_type
#   etag         = filemd5(each.value.source)
# }
