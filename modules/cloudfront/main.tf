resource "aws_cloudfront_origin_access_identity" "oai" {
  comment = "OAI for our domain"
}

data "aws_cloudfront_cache_policy" "optimized" {
  name = "Managed-CachingOptimized"
}

resource "aws_cloudfront_distribution" "this" {

  origin {
    domain_name = "${var.api_gw_id}.execute-api.${var.region}.amazonaws.com"
    origin_id   = local.api_gw_origin_id
    # origin_path = "dev" //TODO: change
    custom_origin_config {
      http_port              = "80"
      https_port             = "443"
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }
  origin {
    domain_name = var.website_bucket_regional_domain_name
    origin_id   = var.s3_bucket_id

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.oai.cloudfront_access_identity_path
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "CDN"
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS", "POST", "PUT", "PATCH", "DELETE"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = var.s3_bucket_id
    cache_policy_id        = data.aws_cloudfront_cache_policy.optimized.id
    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Name = "main"
  }
}

resource "aws_s3_bucket_policy" "OAI_policy" {
  bucket = var.s3_bucket_origin_id
  policy = data.aws_iam_policy_document.frontend_OAI_policy.json
}
