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

resource "aws_cloudfront_function" "viewer_request" {
  name    = var.viewer_request_function
  runtime = "cloudfront-js-2.0"
  publish = true
  code    = file("${path.root}/resources/cloudfront/${var.viewer_request_function}.js")
}

#######################################
#       Cloudfront Distribution       #
#######################################

resource "aws_cloudfront_distribution" "this" {

  origin {
    domain_name = "${var.api_gw.id}.execute-api.${var.region}.amazonaws.com"
    # domain_name = var.api_gw.invoke_url
    origin_id = local.api_gw_origin_id
    # origin_path = format("/%s", var.api_gw.stage)
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
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = var.static_website.id # Use the s3 origin

    cache_policy_id = aws_cloudfront_cache_policy.frontend_cache_policy.id

    # forwarded_values {
    #   query_string = false

    #   cookies {
    #     forward = "none"
    #   }
    # }

    # default_ttl = 0
    # min_ttl     = 10
    # max_ttl     = 10
    # compress = true

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.viewer_request.arn
    }

    viewer_protocol_policy = "redirect-to-https"
  }

  ordered_cache_behavior {
    path_pattern     = format("/%s/*", var.api_gw.stage) # Redirect these requests to the API GW
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = local.api_gw_origin_id # Use the apigw origin

    # default_ttl = 1
    # min_ttl     = 0
    # max_ttl     = 1
    # compress    = false
    # forwarded_values {
    #   query_string = true

    #   headers = ["Authorization"]
    #   cookies {
    #     forward = "all"
    #   }
    # }

    cache_policy_id = aws_cloudfront_cache_policy.api_gw_cache_policy.id

    viewer_protocol_policy = "redirect-to-https"
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

  depends_on = [
    aws_cloudfront_function.viewer_request,
    aws_cloudfront_cache_policy.frontend_cache_policy,
    aws_cloudfront_cache_policy.api_gw_cache_policy
  ]
}

#################################
#       Request Policies        #
#################################

resource "aws_cloudfront_cache_policy" "frontend_cache_policy" {
  name    = "Condor-Custom-CachingOptimized"
  comment = "Custom policy equivalent to CachingOptimized so terraform doesn't throw errors on the apply operation"

  default_ttl = 86400
  min_ttl     = 1
  max_ttl     = 31536000
  parameters_in_cache_key_and_forwarded_to_origin {
    enable_accept_encoding_brotli = true
    enable_accept_encoding_gzip   = true
    cookies_config {
      cookie_behavior = "none"
    }
    headers_config {
      header_behavior = "none"
    }
    query_strings_config {
      query_string_behavior = "none"
    }
  }

}

resource "aws_cloudfront_cache_policy" "api_gw_cache_policy" {
  name    = "Condor-Custom-CachingDisabled"
  comment = "Custom policy equivalent to CachingDisabled so terraform doesn't throw errors on the apply operation"

  default_ttl = 1
  max_ttl     = 1
  min_ttl     = 0

  parameters_in_cache_key_and_forwarded_to_origin {
    enable_accept_encoding_brotli = false
    enable_accept_encoding_gzip   = false
    cookies_config {
      cookie_behavior = "all"
    }
    headers_config {
      header_behavior = "whitelist"
      headers {
        items = ["Authorization"]
      }
    }
    query_strings_config {
      query_string_behavior = "all"
    }
  }
}
