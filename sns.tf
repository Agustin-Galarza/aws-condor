module "sns" {
  source  = "terraform-aws-modules/sns/aws"
  version = "5.3.0"

  name = "Reports"
}


