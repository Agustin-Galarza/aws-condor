
resource "aws_api_gateway_resource" "this" {
  rest_api_id = var.rest_api_id
  parent_id   = var.parent_id
  path_part   = var.path_part
}

resource "aws_api_gateway_method" "this" {
  for_each      = { for method in var.methods : method.http_method => method }
  rest_api_id   = var.rest_api_id
  resource_id   = aws_api_gateway_resource.this.id
  http_method   = each.value.http_method
  authorization = var.authorizer_type
  authorizer_id = var.authorizer_id

  request_parameters = {
    "method.request.path.proxy" = true,
  }

  depends_on = [aws_api_gateway_resource.this]
}

resource "aws_api_gateway_integration" "this" {
  for_each = { for method in var.methods : method.http_method => method }

  rest_api_id = var.rest_api_id
  resource_id = aws_api_gateway_resource.this.id
  http_method = each.value.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = each.value.integration_uri

  depends_on = [aws_api_gateway_resource.this, aws_api_gateway_method.this]
}

resource "aws_api_gateway_method_response" "this" {
  for_each = { for method in var.methods : method.http_method => method }

  rest_api_id = var.rest_api_id
  resource_id = aws_api_gateway_resource.this.id
  http_method = each.value.http_method

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  status_code = "200"

  depends_on = [aws_api_gateway_resource.this, aws_api_gateway_method.this]
}

resource "aws_api_gateway_integration_response" "this" {
  for_each = { for method in var.methods : method.http_method => method }

  rest_api_id = var.rest_api_id
  resource_id = aws_api_gateway_resource.this.id
  http_method = each.value.http_method

  status_code = aws_api_gateway_method_response.this[each.key].status_code

  depends_on = [aws_api_gateway_method_response.this, aws_api_gateway_method.this, aws_api_gateway_integration.this]
}

