output "id" {
  value       = aws_cognito_user_pool.userpool.id
  description = "The ID of the Cognito User Pool"
}

output "arn" {
  value       = aws_cognito_user_pool.userpool.arn
  description = "The ARN of the Cognito User Pool"
}

output "user_pool_client_id" {
  value       = aws_cognito_user_pool_client.userpool_client.id
  description = "The ID of the Cognito User Pool Client"
}
