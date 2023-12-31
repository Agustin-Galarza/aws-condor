data "aws_caller_identity" "this" {}

data "aws_iam_policy_document" "this" {
  version   = "2008-10-17"
  policy_id = "PolicyForCloudFrontPrivateContent"
  statement {
    sid    = "AllowCloudFrontServicePrincipal"
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }
    actions   = ["s3:GetObject"]
    resources = ["${var.static_website.bucket_arn}/*"]
    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values = [
        aws_cloudfront_distribution.this.arn
      ]
    }
  }
}

# TODO: create our own policies, identical to these ones to aviod the 'Error: Provider produced inconsistent final plan'
data "aws_cloudfront_cache_policy" "frontend_cache_policy" {
  name = "Managed-CachingOptimized"
}

data "aws_cloudfront_cache_policy" "api_gw_cache_policy" {
  name = "Managed-CachingDisabled"
}

data "aws_cloudfront_origin_request_policy" "frontend_request_policy" {
  name = "Managed-CORS-S3Origin"
}

data "aws_cloudfront_origin_request_policy" "api_gw_request_policy" {
  name = "Managed-AllViewerExceptHostHeader"
}
