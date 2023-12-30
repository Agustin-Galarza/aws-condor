
module "reports" {
  source = "terraform-aws-modules/s3-bucket/aws"
  # bucket        = var.base_name
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

# resource "aws_s3_object" "data" {
#   for_each = { for file in local.file_with_type : file.name => file }

#   bucket        = module.frontend.s3_bucket_id
#   key           = each.value.name
#   source        = "${var.frontend_folder}/${each.value.name}"
#   etag          = filemd5("${var.frontend_folder}/${each.value.name}")
#   content_type  = each.value.type
#   storage_class = "STANDARD"
# }

# resource "aws_s3_object" "data" {
#   for_each = { for file in local.file_with_type : file.dest => file }

#   bucket = module.frontend.s3_bucket_id

#   key          = each.value.dest
#   source       = each.value.source
#   content_type = each.value.content_type
#   etag         = filemd5(each.value.source)
# }
