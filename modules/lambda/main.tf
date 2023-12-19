resource "aws_lambda_function" "index" {
  function_name = var.function_name

  filename         = local.filename
  source_code_hash = filebase64sha256(local.filename)

  handler = var.handler
  runtime = var.runtime

  environment {
    variables = var.env_variables
  }

  role = var.role_arn
}

resource "aws_lambda_permission" "apigw_lambda" {
  statement_id  = "AllowAPIInvoke"
  action        = "lambda:InvokeFunction"
  function_name = var.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${var.apigw_arn}/*/${var.endpoint.method}/${var.endpoint.path}"
}
