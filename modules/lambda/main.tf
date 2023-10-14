resource "aws_lambda_function" "index" {
  function_name = var.function_name

  filename         = "resources/lambda_sources/${var.zip_name}"
  source_code_hash = filebase64sha256("resources/lambda_sources/${var.zip_name}")

  handler = var.handler
  runtime = var.runtime


  role = aws_iam_role.lambda_exec.arn
}

resource "aws_iam_role" "lambda_exec" {
  name = "serverless_example_lambda"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

data "aws_caller_identity" "current" {}

resource "aws_lambda_permission" "apigw_lambda" {
  statement_id  = "AllowAPIInvoke"
  action        = "lambda:InvokeFunction"
  function_name = var.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${var.apigw_arn}/*" // TODO: change to something more specific of the lambda, like  "arn:aws:execute-api:${var.aws_region}:${var.aws_account_id}:${var.gateway_id}/*/${aws_api_gateway_method.this.http_method}${aws_api_gateway_resource.this.path}"
}
