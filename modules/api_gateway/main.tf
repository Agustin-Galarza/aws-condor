resource "aws_api_gateway_rest_api" "this" {
  name = var.name
  tags = var.tags
}

module "lambda" {
  source = "../lambda"

  apigw_arn = aws_api_gateway_rest_api.this.execution_arn
}

// Stage
resource "aws_api_gateway_stage" "this" {
  deployment_id = aws_api_gateway_deployment.this.id
  rest_api_id   = aws_api_gateway_rest_api.this.id
  stage_name    = var.stage
}

// Authorizers
resource "aws_api_gateway_authorizer" "this" {
  name            = var.authorizer.name
  rest_api_id     = aws_api_gateway_rest_api.this.id
  type            = var.authorizer.type
  identity_source = "method.request.header.Authorization"
  provider_arns   = [var.cognito_arn]
  authorizer_uri  = var.cognito_arn

}

// Endpoints
module "api_gateway_endpoint" {

  source   = "./api_gateway_endpoint"
  for_each = { for method in var.methods : "${method.path}-${method.http_method}" => method }

  rest_api_id     = aws_api_gateway_rest_api.this.id
  stage_name      = var.stage
  parent_id       = aws_api_gateway_rest_api.this.root_resource_id
  path_part       = each.value.path
  http_method     = each.value.http_method
  authorizer_type = var.authorizer.type
  authorizer_id   = aws_api_gateway_authorizer.this.id
  integration_uri = module.lambda.invoke_arn
}


locals {
  endpoint_ids = flatten([
    for endpoint in module.api_gateway_endpoint : [
      endpoint.resource_id
    ]
  ])
}

// Deploy
resource "aws_api_gateway_deployment" "this" {
  rest_api_id = aws_api_gateway_rest_api.this.id

  depends_on = [
    module.api_gateway_endpoint
  ]

  lifecycle {
    create_before_destroy = true
  }

  triggers = {
    redeploy = sha1(jsonencode(local.endpoint_ids))
  }

}

// Permissions





