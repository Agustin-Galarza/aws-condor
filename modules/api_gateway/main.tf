resource "aws_api_gateway_rest_api" "this" {
  name = var.name
  tags = var.tags
}

module "lambda" {
  source = "../lambda"

  for_each = {
    for entry in flatten([for val in var.methods : [for method in val.methods : {
      path          = val.path
      name          = method.name
      http_method   = method.http_method
      handler       = method.handler
      zip_name      = method.zip_name
      env_variables = method.env_variables
    }]]) : "${entry.path}-${entry.http_method}" => entry
  }

  role_arn = var.role_arn

  function_name = each.value.name
  zip_name      = each.value.zip_name
  apigw_arn     = aws_api_gateway_rest_api.this.execution_arn
  endpoint = {
    path   = each.value.path
    method = each.value.http_method
  }

  handler = each.value.handler

  env_variables = each.value.env_variables
}

// Stage
resource "aws_api_gateway_stage" "this" {
  deployment_id = aws_api_gateway_deployment.this.id
  rest_api_id   = aws_api_gateway_rest_api.this.id
  stage_name    = var.stage
}

// Authorizers
resource "aws_api_gateway_authorizer" "this" {
  name                   = var.authorizer.name
  rest_api_id            = aws_api_gateway_rest_api.this.id
  type                   = var.authorizer.type
  identity_source        = "method.request.header.Authorization"
  provider_arns          = [var.cognito_arn]
  authorizer_uri         = var.cognito_arn
  authorizer_credentials = local.lab_role

}

// Endpoints
module "api_gateway_endpoint" {

  source   = "./api_gateway_endpoint"
  for_each = { for method in var.methods : method.path => method }

  rest_api_id = aws_api_gateway_rest_api.this.id
  stage_name  = var.stage
  parent_id   = aws_api_gateway_rest_api.this.root_resource_id
  path_part   = each.value.path
  methods = [for method in each.value.methods : {
    http_method     = method.http_method
    integration_uri = module.lambda["${each.value.path}-${method.http_method}"].invoke_arn
  }]
  authorizer_type = var.authorizer.type
  authorizer_id   = aws_api_gateway_authorizer.this.id
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





