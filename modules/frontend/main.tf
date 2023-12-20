// Logs
module "logs" {
  source        = "terraform-aws-modules/s3-bucket/aws"
  bucket_prefix = local.logs_bucket_name
  acl           = "log-delivery-write"

  force_destroy = true

  attach_deny_insecure_transport_policy = true
  attach_require_latest_tls_policy      = true

  control_object_ownership = true
  object_ownership         = "ObjectWriter"
}

// Imágenes
resource "aws_s3_bucket" "reports" {
  bucket = "reportes.dev.condor.com"
  #  object_lock_enabled = true
  force_destroy = true


  tags = {
    type = "reports"
  }
}

# resource "aws_s3_bucket_logging" "reports" {
#   bucket = aws_s3_bucket.reports.id

#   target_bucket = module.logs.s3_bucket_id
#   target_prefix = "log/"
# }

resource "aws_s3_bucket_public_access_block" "reports" {
  bucket = aws_s3_bucket.reports.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_ownership_controls" "reports" {
  bucket = aws_s3_bucket.reports.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "reports" {
  depends_on = [aws_s3_bucket_ownership_controls.reports]

  bucket = aws_s3_bucket.reports.id
  acl    = "private"
}

resource "aws_s3_bucket_server_side_encryption_configuration" "reports" {
  bucket = aws_s3_bucket.reports.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}


# resource "aws_s3_bucket_policy" "OAI_policy" {
#   bucket = var.s3_bucket_id
#   policy = data.aws_iam_policy_document.frontend_OAI_policy.json
# }

// condor.com bucket
resource "aws_s3_bucket" "frontend" {
  bucket = var.frontend_name
  #  object_lock_enabled = true
  force_destroy = true


  tags = {
    type = "frontend"
  }
}

resource "aws_s3_bucket_logging" "this" {
  bucket = aws_s3_bucket.frontend.id

  target_bucket = module.logs.s3_bucket_id
  target_prefix = "log/"
}

resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_ownership_controls" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "frontend" {
  depends_on = [aws_s3_bucket_ownership_controls.frontend]

  bucket = aws_s3_bucket.frontend.id
  acl    = "private"
}

resource "aws_s3_object" "frontend" {
  for_each = { for file in local.file_with_type : file.name => file }

  bucket        = aws_s3_bucket.frontend.id
  key           = each.value.name
  source        = "${var.frontend_folder}/${each.value.name}"
  etag          = filemd5("${var.frontend_folder}/${each.value.name}")
  content_type  = each.value.type
  storage_class = "STANDARD"
}

resource "aws_s3_bucket_website_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

// www.condor.com bucket
resource "aws_s3_bucket" "www" {
  bucket = local.www_frontend_bucket_name
  #  object_lock_enabled = true
  force_destroy = true

  tags = {
    type = "frontend"
  }
}

resource "aws_s3_bucket_ownership_controls" "www" {
  bucket = aws_s3_bucket.www.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "www" {
  depends_on = [aws_s3_bucket_ownership_controls.www]

  bucket = aws_s3_bucket.www.id
  acl    = "private"
}

resource "aws_s3_bucket_logging" "www" {
  bucket = aws_s3_bucket.www.id

  target_bucket = module.logs.s3_bucket_id
  target_prefix = "log/"
}

resource "aws_s3_bucket_website_configuration" "www" {
  bucket = aws_s3_bucket.www.id

  redirect_all_requests_to {
    host_name = aws_s3_bucket.frontend.bucket_domain_name
  }
}

resource "aws_s3_bucket_public_access_block" "www" {
  bucket = aws_s3_bucket.www.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "www" {
  bucket = aws_s3_bucket.www.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}
