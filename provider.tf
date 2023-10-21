provider "aws" {

  region = "us-east-1"

  alias = "aws"

  shared_credentials_files = ["~/.aws/credentials"]
  profile                  = "default"

  default_tags {
    tags = {
      author  = "Grupo 4"
      version = "1.0"
      project = "Condor"
      year    = "2023"
    }
  }
}

# resource "aws_iam_role" "example_role" {
#   name = "ExampleRole"
#   assume_role_policy = jsonencode({
#     Version = "2012-10-17",
#     Statement = [
#       {
#         Action = "sts:AssumeRole",
#         Effect = "Allow",
#         Principal = {
#           Service = "lambda.amazonaws.com"
#         }
#       }
#     ]
#   })
# }

# resource "aws_iam_policy" "example_policy" {
#   name = "ExamplePolicy"

#   policy = jsonencode({
#     Version = "2012-10-17",
#     Statement = [

#     ]
#   })
# }

# resource "aws_iam_role_policy_attachment" "example_attachment" {
#   policy_arn = aws_iam_policy.example_policy.arn
#   role       = aws_iam_role.example_role.name
# }
