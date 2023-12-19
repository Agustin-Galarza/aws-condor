data "aws_iam_policy_document" "frontend_OAI_policy" {
  statement {
    sid     = "PublicReadGetObject"
    effect  = "Allow"
    actions = ["s3:GetObject"]
    principals {
      type        = "AWS"
      identifiers = [aws_cloudfront_origin_access_identity.oai.iam_arn]
    }
    resources = [var.s3_bucket_arn, "${var.s3_bucket_arn}/*"]
  }
}

data "aws_cloudfront_cache_policy" "optimized_policy" {
  name = "Managed-CachingOptimized"
}
