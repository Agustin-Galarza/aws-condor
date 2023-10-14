output "endpoint_ids" {
  value       = [for endpoint in module.api_gateway_endpoint : endpoint.resource_id]
  description = "The ids of the endpoints created"
}

output "api_gateway_arn" {
  value = aws_api_gateway_rest_api.this.execution_arn
}

output "api_gateway_id" {
  value       = aws_api_gateway_rest_api.this.id
  description = "The id of the api gateway"
}

output "api_gateway_deploy_id" {
  value       = aws_api_gateway_deployment.this.id
  description = "The id of the api gateway deployment"
}

output "api_gateway_invoke_url" {
  value       = aws_api_gateway_deployment.this.invoke_url
  description = "The invoke url of the api gateway"
}

output "api_gateway_stage" {
  value       = aws_api_gateway_stage.this.stage_name
  description = "The invoke url of the api gateway stage"
}

output "api_gateway_authorizer_id" {
  value       = aws_api_gateway_authorizer.this.id
  description = "The id of the api gateway authorizer"
}


