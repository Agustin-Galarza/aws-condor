
output "arn" {
  value = aws_lambda_function.index.arn
}

output "invoke_arn" {
  value = aws_lambda_function.index.invoke_arn
}
