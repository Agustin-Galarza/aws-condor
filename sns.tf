module "sns" {
  source  = "terraform-aws-modules/sns/aws"
  version = "5.3.0"

  name = "Reports"

  topic_policy = <<EOF
  {
    "Version": "2012-10-17",
    "Id": "MySNSPolicy",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": "*",
        "Action": "SNS:GetTopicAttributes",
        "Resource": "*"
      }
    ]
  }
  EOF
}
