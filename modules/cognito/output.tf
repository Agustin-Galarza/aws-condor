output "cognito_id" {
  value       = aws_cognito_user_pool.this.id
  description = "The ID of the Cognito User Pool"
}

output "cognito_arn" {
  value       = aws_cognito_user_pool.this.arn
  description = "The ARN of the Cognito User Pool"
}

output "cognito_client_id" {
  value       = aws_cognito_user_pool_client.this.id
  description = "The ID of the Cognito User Pool Client"
}

