resource "aws_s3_bucket" "this" {
  bucket              = var.name
}

data "aws_iam_policy_document" "this" {
  statement {
    sid       = "AllowPublicRead"
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.this.arn}/*"]
    principals {
      type        = "AWS"
      identifiers = ["*"]
    }
  }
}

resource "aws_s3_bucket_logging" "this" {
  bucket        = var.bucket_to_log
  target_bucket = aws_s3_bucket.this.id
  target_prefix = "condor-logs/"
}
#
#resource "aws_s3_bucket_acl" "this" {
#  bucket = aws_s3_bucket.this.id
#  acl    = "log-delivery-write"
#}
#resource "aws_s3_bucket_policy" "www" {
#  bucket = aws_s3_bucket.this.id
#
#  policy = data.aws_iam_policy_document.this.json
#}

