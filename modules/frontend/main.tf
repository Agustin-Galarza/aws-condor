// condor.com bucket
resource "aws_s3_bucket" "frontend" {
  bucket = var.frontend_name
  #  object_lock_enabled = true
  force_destroy = true


  tags = {
    type = "frontend"
  }
}

resource "aws_s3_bucket_logging" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  target_bucket = aws_s3_bucket.frontend.id
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

  target_bucket = aws_s3_bucket.www.id
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
