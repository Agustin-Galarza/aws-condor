output "resource_id" {
  value       = aws_api_gateway_resource.this.id
  description = "The ID of the API Gateway resource."
}

output "method_ids" {
  value       = [for method in aws_api_gateway_method.this : method.id]
  description = "The ID of the API Gateway method."
}

output "integration_ids" {
  value       = [for integration in aws_api_gateway_integration.this : integration.id]
  description = "The ID of the API Gateway integration."
}

output "method_responses_id" {
  value       = [for method_response in aws_api_gateway_method_response.this : method_response.id]
  description = "The ID of the API Gateway method response."
}

output "integration_response_ids" {
  value       = [for integration_response in aws_api_gateway_integration_response.this : integration_response.id]
  description = "The ID of the API Gateway integration response."
}

