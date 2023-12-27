# data "aws_iam_policy_document" "this" {
#   statement {
#     sid     = "PublicReadGetObject"
#     effect  = "Allow"
#     actions = ["s3:GetObject"]
#     principals {
#       type        = "AWS"
#       identifiers = ["*"] // TODO: change this to the specific OAI
#     }
#     resources = ["${aws_s3_bucket.this.arn}/*"]
#   }
# }
