output "resource_id" {
  value       = aws_api_gateway_resource.this.id
  description = "The ID of the API Gateway resource."
}

output "method_id" {
  value       = aws_api_gateway_method.this.id
  description = "The ID of the API Gateway method."
}

output "integration_id" {
  value       = aws_api_gateway_integration.this.id
  description = "The ID of the API Gateway integration."
}

output "method_response_id" {
  value       = aws_api_gateway_method_response.this.id
  description = "The ID of the API Gateway method response."
}

output "integration_response_id" {
  value       = aws_api_gateway_integration_response.this.id
  description = "The ID of the API Gateway integration response."
}

