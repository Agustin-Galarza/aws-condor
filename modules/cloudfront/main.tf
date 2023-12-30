resource "aws_cloudfront_origin_access_control" "this" {
  name                              = "this"
  description                       = "Origin Access Control for the frontend bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_s3_bucket_policy" "this" {
  bucket = var.static_website.id
  policy = data.aws_iam_policy_document.this.json
}

resource "aws_cloudfront_distribution" "this" {

  origin {
    domain_name = "${var.api_gw.id}.execute-api.${var.region}.amazonaws.com"
    # domain_name = var.api_gw.invoke_url
    origin_id   = local.api_gw_origin_id
    origin_path = format("/%s", var.api_gw.stage)
    custom_origin_config {
      http_port              = "80"
      https_port             = "443"
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # aliases = var.aliases

  origin {
    domain_name              = var.static_website.domain_name
    origin_id                = var.static_website.id
    origin_access_control_id = aws_cloudfront_origin_access_control.this.id
  }

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "The Cloudfront distribution for the static website and the API"
  default_root_object = var.static_website.default_root_object

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS", "POST", "PUT", "PATCH", "DELETE"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = var.static_website.id
    viewer_protocol_policy = "redirect-to-https"
    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }
    min_ttl     = 0
    default_ttl = 5
    max_ttl     = 10
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
    # acm_certificate_arn            = var.certificate_arn
    # minimum_protocol_version       = "TLSv1.2_2021"
    # ssl_support_method             = "sni-only"
  }
  tags = {
    Name = "main"
  }

  provisioner "local-exec" {
    command = <<-EOT
      echo "VITE_API_URL=${aws_cloudfront_distribution.this.domain_name}" >> ${var.frontend_folder}/.env
    EOT
  }
}
