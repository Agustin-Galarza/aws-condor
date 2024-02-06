resource "aws_api_gateway_rest_api" "this" {
  name = var.name
  tags = var.tags

  binary_media_types = [ 
    "multipart/form-data",
    "image/*",
    "application/octet-stream"
   ]
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

// Deploy
resource "aws_api_gateway_deployment" "this" {
  rest_api_id = aws_api_gateway_rest_api.this.id

  lifecycle {
    create_before_destroy = true
  }

  triggers = {
    redeploy = sha1(jsonencode([
      // users
      aws_api_gateway_resource.users.id,
      // users_get
      aws_api_gateway_method.users_get.id,
      aws_api_gateway_integration.users_get.id,
      // users_post
      aws_api_gateway_method.users_post.id,
      aws_api_gateway_integration.users_post.id,
      // users/{id}
      aws_api_gateway_resource.users_id.id,
      // users_id_get
      aws_api_gateway_method.users_id_get.id,
      aws_api_gateway_integration.users_id_get.id,
      // gropus
      aws_api_gateway_resource.groups.id,
      // groups_get
      aws_api_gateway_method.groups_get.id,
      aws_api_gateway_integration.groups_get.id,
      // groups_post
      aws_api_gateway_method.groups_post.id,
      aws_api_gateway_integration.groups_post.id,
      // groups_groupname_get
      aws_api_gateway_resource.groups_groupname.id,
      aws_api_gateway_method.groups_groupname_get.id,
      aws_api_gateway_integration.groups_groupname_get.id,
      // groups_groupname_addmember
      aws_api_gateway_resource.groups_groupname_addmember.id,
      aws_api_gateway_method.groups_groupname_addmember.id,
      aws_api_gateway_integration.groups_groupname_addmember.id,
      // groups_groupname_reports
      aws_api_gateway_resource.groups_groupname_reports.id,
      aws_api_gateway_method.groups_groupname_reports_get.id,
      aws_api_gateway_integration.groups_groupname_reports_get.id,
      // reports
      aws_api_gateway_resource.reports.id,
      // reports_get
      aws_api_gateway_method.reports_get.id,
      aws_api_gateway_integration.reports_get.id,
      // reports_post
      aws_api_gateway_method.reports_post.id,
      aws_api_gateway_integration.reports_post.id,
      // reports_id
      aws_api_gateway_resource.reports_id.id,
      // reports_id_get
      aws_api_gateway_method.reports_id_get.id,
      aws_api_gateway_integration.reports_id_get.id,
      // images
      aws_api_gateway_resource.images.id,
      // images_id
      aws_api_gateway_resource.images_id.id,
      // images_id_get
      aws_api_gateway_method.images_id_get.id,
      aws_api_gateway_integration.images_id_get.id,
      // images_id_downloadurl
      aws_api_gateway_resource.images_id_downloadurl.id,
      // images_id_downloadurl_get
      aws_api_gateway_method.images_id_downloadurl_get.id,
      aws_api_gateway_integration.images_id_downloadurl_get.id,
    ]))
  }

}

module "lambda" {
  source = "../lambda"

  for_each = {
    for val in var.lambdas : "${val.path}-${val.http_method}" => val
  }

  role_arn = var.role_arn

  function_name = each.value.name
  zip_name      = each.value.zip_name
  apigw_arn     = aws_api_gateway_rest_api.this.execution_arn
  endpoint = {
    path   = each.value.path
    method = each.value.http_method
  }
  layers_arns = var.layers_arns

  handler = each.value.handler

  env_variables = each.value.env_variables
}

// Endpoints

//// users
resource "aws_api_gateway_resource" "users" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  parent_id   = aws_api_gateway_rest_api.this.root_resource_id
  path_part   = "users"
}

//// GET users
resource "aws_api_gateway_method" "users_get" {
  rest_api_id   = aws_api_gateway_rest_api.this.id
  resource_id   = aws_api_gateway_resource.users.id
  http_method   = "GET"
  authorization = var.authorizer.type
  authorizer_id = aws_api_gateway_authorizer.this.id

  request_parameters = {
    "method.request.path.proxy" = true,
  }

  depends_on = [aws_api_gateway_resource.users]
}

resource "aws_api_gateway_integration" "users_get" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.users.id
  http_method = aws_api_gateway_method.users_get.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda["users-GET"].invoke_arn

  depends_on = [aws_api_gateway_resource.users, aws_api_gateway_method.users_get]
}

resource "aws_api_gateway_method_response" "users_get" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.users.id
  http_method = "GET"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  status_code = "200"

  depends_on = [aws_api_gateway_resource.users, aws_api_gateway_method.users_get]
}

resource "aws_api_gateway_integration_response" "users_get" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.users.id
  http_method = "GET"

  status_code = aws_api_gateway_method_response.users_get.status_code

  depends_on = [aws_api_gateway_method_response.users_get, aws_api_gateway_method.users_get, aws_api_gateway_integration.users_get]
}

//// POST users
resource "aws_api_gateway_method" "users_post" {
  rest_api_id   = aws_api_gateway_rest_api.this.id
  resource_id   = aws_api_gateway_resource.users.id
  http_method   = "POST"
  authorization = var.authorizer.type
  authorizer_id = aws_api_gateway_authorizer.this.id
  request_parameters = {
    "method.request.path.proxy" = true,
  }
}

resource "aws_api_gateway_integration" "users_post" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.users.id
  http_method = aws_api_gateway_method.users_post.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda["users-POST"].invoke_arn
}

resource "aws_api_gateway_method_response" "users_post" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.users.id
  http_method = aws_api_gateway_method.users_post.http_method

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  status_code = "200"
}

resource "aws_api_gateway_integration_response" "users_post" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.users.id
  http_method = aws_api_gateway_method_response.users_post.http_method

  status_code = aws_api_gateway_method_response.users_post.status_code

  depends_on = [aws_api_gateway_integration.users_post]
}

//// users/{id}
resource "aws_api_gateway_resource" "users_id" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  parent_id   = aws_api_gateway_resource.users.id
  path_part   = "{id}"
}

//// GET users/{id}
resource "aws_api_gateway_method" "users_id_get" {
  rest_api_id   = aws_api_gateway_rest_api.this.id
  resource_id   = aws_api_gateway_resource.users_id.id
  http_method   = "GET"
  authorization = var.authorizer.type
  authorizer_id = aws_api_gateway_authorizer.this.id

  request_parameters = {
    "method.request.path.proxy" = true,
  }
}

resource "aws_api_gateway_integration" "users_id_get" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.users_id.id
  http_method = aws_api_gateway_method.users_id_get.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda["users/{id}-GET"].invoke_arn
}

resource "aws_api_gateway_method_response" "users_id_get" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.users_id.id
  http_method = aws_api_gateway_method.users_id_get.http_method

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  status_code = "200"
}

resource "aws_api_gateway_integration_response" "users_id_get" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.users_id.id
  http_method = aws_api_gateway_method_response.users_id_get.http_method

  status_code = aws_api_gateway_method_response.users_id_get.status_code

  depends_on = [aws_api_gateway_integration.users_id_get]
}

//// groups
resource "aws_api_gateway_resource" "groups" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  parent_id   = aws_api_gateway_rest_api.this.root_resource_id
  path_part   = "groups"
}
//// GET groups
resource "aws_api_gateway_method" "groups_get" {
  rest_api_id   = aws_api_gateway_rest_api.this.id
  resource_id   = aws_api_gateway_resource.groups.id
  http_method   = "GET"
  authorization = "NONE"

  request_parameters = {
    "method.request.path.proxy" = true,
  }
}

resource "aws_api_gateway_integration" "groups_get" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.groups.id
  http_method = aws_api_gateway_method.groups_get.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda["groups-GET"].invoke_arn
}

resource "aws_api_gateway_method_response" "groups_get" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.groups.id
  http_method = aws_api_gateway_method.groups_get.http_method

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  status_code = "200"
}

resource "aws_api_gateway_integration_response" "groups_get" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.groups.id
  http_method = aws_api_gateway_method_response.groups_get.http_method

  status_code = aws_api_gateway_method_response.groups_get.status_code

  depends_on = [aws_api_gateway_integration.groups_get]
}

//// POST groups
resource "aws_api_gateway_method" "groups_post" {
  rest_api_id   = aws_api_gateway_rest_api.this.id
  resource_id   = aws_api_gateway_resource.groups.id
  http_method   = "POST"
  authorization = var.authorizer.type
  authorizer_id = aws_api_gateway_authorizer.this.id

  request_parameters = {
    "method.request.path.proxy" = true,
  }
}

resource "aws_api_gateway_integration" "groups_post" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.groups.id
  http_method = aws_api_gateway_method.groups_post.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda["groups-POST"].invoke_arn
}

resource "aws_api_gateway_method_response" "groups_post" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.groups.id
  http_method = aws_api_gateway_method.groups_post.http_method

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  status_code = "200"
}

resource "aws_api_gateway_integration_response" "groups_post" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.groups.id
  http_method = aws_api_gateway_method_response.groups_post.http_method

  status_code = aws_api_gateway_method_response.groups_post.status_code

  depends_on = [aws_api_gateway_integration.groups_post]
}

//// groups/{groupname}
resource "aws_api_gateway_resource" "groups_groupname" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  parent_id   = aws_api_gateway_resource.groups.id
  path_part   = "{groupname}"
}

//// GET groups/{groupname}
resource "aws_api_gateway_method" "groups_groupname_get" {
  rest_api_id   = aws_api_gateway_rest_api.this.id
  resource_id   = aws_api_gateway_resource.groups_groupname.id
  http_method   = "GET"
  authorization = "NONE"

  request_parameters = {
    "method.request.path.proxy" = true,
  }
}

resource "aws_api_gateway_integration" "groups_groupname_get" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.groups_groupname.id
  http_method = aws_api_gateway_method.groups_groupname_get.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda["groups/{groupname}-GET"].invoke_arn
}

resource "aws_api_gateway_method_response" "groups_groupname_get" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.groups_groupname.id
  http_method = aws_api_gateway_method.groups_groupname_get.http_method

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  status_code = "200"
}

resource "aws_api_gateway_integration_response" "groups_groupname_get" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.groups_groupname.id
  http_method = aws_api_gateway_method_response.groups_groupname_get.http_method

  status_code = aws_api_gateway_method_response.groups_groupname_get.status_code

  depends_on = [aws_api_gateway_integration.groups_groupname_get]
}

///// groups/{groupname}/addMember
resource "aws_api_gateway_resource" "groups_groupname_addmember" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  parent_id   = aws_api_gateway_resource.groups_groupname.id
  path_part   = "addMember"
}
//// POST groups/{groupname}/addMember
resource "aws_api_gateway_method" "groups_groupname_addmember" {
  rest_api_id   = aws_api_gateway_rest_api.this.id
  resource_id   = aws_api_gateway_resource.groups_groupname_addmember.id
  http_method   = "POST"
  authorization = var.authorizer.type
  authorizer_id = aws_api_gateway_authorizer.this.id

  request_parameters = {
    "method.request.path.proxy" = true,
  }
}

resource "aws_api_gateway_integration" "groups_groupname_addmember" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.groups_groupname_addmember.id
  http_method = aws_api_gateway_method.groups_groupname_addmember.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda["groups/{groupname}/addMember-POST"].invoke_arn
}

resource "aws_api_gateway_method_response" "groups_groupname_addmember" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.groups_groupname_addmember.id
  http_method = aws_api_gateway_method.groups_groupname_addmember.http_method

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  status_code = "200"
}

resource "aws_api_gateway_integration_response" "groups_groupname_addmember" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.groups_groupname_addmember.id
  http_method = aws_api_gateway_method_response.groups_groupname_addmember.http_method

  status_code = aws_api_gateway_method_response.groups_groupname_addmember.status_code

  depends_on = [aws_api_gateway_integration.groups_groupname_addmember]
}

///// groups/{groupname}/reports
resource "aws_api_gateway_resource" "groups_groupname_reports" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  parent_id   = aws_api_gateway_resource.groups_groupname.id
  path_part   = "reports"
}
//// GET groups/{groupname}/reports
resource "aws_api_gateway_method" "groups_groupname_reports_get" {
  rest_api_id   = aws_api_gateway_rest_api.this.id
  resource_id   = aws_api_gateway_resource.groups_groupname_reports.id
  http_method   = "GET"
  authorization = var.authorizer.type
  authorizer_id = aws_api_gateway_authorizer.this.id

  request_parameters = {
    "method.request.path.proxy" = true,
  }
}

resource "aws_api_gateway_integration" "groups_groupname_reports_get" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.groups_groupname_reports.id
  http_method = aws_api_gateway_method.groups_groupname_reports_get.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda["groups/{groupname}/reports-GET"].invoke_arn
}

resource "aws_api_gateway_method_response" "groups_groupname_reports_get" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.groups_groupname_reports.id
  http_method = aws_api_gateway_method.groups_groupname_reports_get.http_method

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  status_code = "200"
}

resource "aws_api_gateway_integration_response" "groups_groupname_reports_get" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.groups_groupname_reports.id
  http_method = aws_api_gateway_method_response.groups_groupname_reports_get.http_method

  status_code = aws_api_gateway_method_response.groups_groupname_reports_get.status_code

  depends_on = [aws_api_gateway_integration.groups_groupname_reports_get]
}

//// reports
resource "aws_api_gateway_resource" "reports" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  parent_id   = aws_api_gateway_rest_api.this.root_resource_id
  path_part   = "reports"
}
//// GET reports
resource "aws_api_gateway_method" "reports_get" {
  rest_api_id   = aws_api_gateway_rest_api.this.id
  resource_id   = aws_api_gateway_resource.reports.id
  http_method   = "GET"
  authorization = var.authorizer.type
  authorizer_id = aws_api_gateway_authorizer.this.id

  request_parameters = {
    "method.request.path.proxy" = true,
  }

  depends_on = [aws_api_gateway_resource.reports]
}

resource "aws_api_gateway_integration" "reports_get" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.reports.id
  http_method = aws_api_gateway_method.reports_get.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda["reports-GET"].invoke_arn

  depends_on = [aws_api_gateway_resource.reports, aws_api_gateway_method.reports_get]
}

resource "aws_api_gateway_method_response" "reports_get" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.reports.id
  http_method = "GET"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  status_code = "200"

  depends_on = [aws_api_gateway_resource.reports, aws_api_gateway_method.reports_get]
}

resource "aws_api_gateway_integration_response" "reports_get" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.reports.id
  http_method = "GET"

  status_code = aws_api_gateway_method_response.reports_get.status_code

  depends_on = [aws_api_gateway_method_response.reports_get, aws_api_gateway_method.reports_get, aws_api_gateway_integration.reports_get]
}
//// POST reports
resource "aws_api_gateway_method" "reports_post" {
  rest_api_id   = aws_api_gateway_rest_api.this.id
  resource_id   = aws_api_gateway_resource.reports.id
  http_method   = "POST"
  authorization = var.authorizer.type
  authorizer_id = aws_api_gateway_authorizer.this.id

  request_parameters = {
    "method.request.path.proxy" = true,
  }

  depends_on = [aws_api_gateway_resource.reports]
}

resource "aws_api_gateway_integration" "reports_post" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.reports.id
  http_method = aws_api_gateway_method.reports_post.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda["reports-POST"].invoke_arn

  depends_on = [aws_api_gateway_resource.reports, aws_api_gateway_method.reports_post]
}

resource "aws_api_gateway_method_response" "reports_post" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.reports.id
  http_method = aws_api_gateway_method.reports_post.http_method

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  status_code = "200"

  depends_on = [aws_api_gateway_resource.reports, aws_api_gateway_method.reports_post]
}

resource "aws_api_gateway_integration_response" "reports_post" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.reports.id
  http_method = aws_api_gateway_method.reports_post.http_method

  status_code = aws_api_gateway_method_response.reports_post.status_code

  depends_on = [aws_api_gateway_method_response.reports_post, aws_api_gateway_method.reports_post, aws_api_gateway_integration.reports_post]
}

//// reports/{reportId}
resource "aws_api_gateway_resource" "reports_id" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  parent_id   = aws_api_gateway_resource.reports.id
  path_part   = "{reportId}"
}
//// GET reports/{reportId}
resource "aws_api_gateway_method" "reports_id_get" {
  rest_api_id   = aws_api_gateway_rest_api.this.id
  resource_id   = aws_api_gateway_resource.reports_id.id
  http_method   = "GET"
  authorization = var.authorizer.type
  authorizer_id = aws_api_gateway_authorizer.this.id

  request_parameters = {
    "method.request.path.proxy" = true,
  }
}

resource "aws_api_gateway_integration" "reports_id_get" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.reports_id.id
  http_method = aws_api_gateway_method.reports_id_get.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda["reports/{reportId}-GET"].invoke_arn
}

resource "aws_api_gateway_method_response" "reports_id_get" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.reports_id.id
  http_method = aws_api_gateway_method.reports_id_get.http_method

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  status_code = "200"
}

resource "aws_api_gateway_integration_response" "reports_id_get" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.reports_id.id
  http_method = aws_api_gateway_method_response.reports_id_get.http_method

  status_code = aws_api_gateway_method_response.reports_id_get.status_code

  depends_on = [aws_api_gateway_integration.reports_id_get]
}

//// images
resource "aws_api_gateway_resource" "images" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  parent_id   = aws_api_gateway_rest_api.this.root_resource_id
  path_part   = "images"
}
//// images/{id}
resource "aws_api_gateway_resource" "images_id" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  parent_id   = aws_api_gateway_resource.images.id
  path_part   = "{id}"
}
//// GET images/{id}
resource "aws_api_gateway_method" "images_id_get" {
  rest_api_id   = aws_api_gateway_rest_api.this.id
  resource_id   = aws_api_gateway_resource.images_id.id
  http_method   = "GET"
  authorization = "NONE"

  request_parameters = {
    "method.request.path.proxy" = true,
  }
}
resource "aws_api_gateway_integration" "images_id_get" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.images_id.id
  http_method = aws_api_gateway_method.images_id_get.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda["images/{id}-GET"].invoke_arn
}

resource "aws_api_gateway_method_response" "images_id_get" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.images_id.id
  http_method = aws_api_gateway_method.images_id_get.http_method

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  status_code = "200"
}

resource "aws_api_gateway_integration_response" "images_id_get" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.images_id.id
  http_method = aws_api_gateway_method_response.images_id_get.http_method

  status_code = aws_api_gateway_method_response.images_id_get.status_code
  depends_on = [aws_api_gateway_integration.images_id_get]
}
//// images/{id}/downloadurl
resource "aws_api_gateway_resource" "images_id_downloadurl" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  parent_id   = aws_api_gateway_resource.images_id.id
  path_part   = "downloadurl"
}
//// GET images/{id}/downloadurl
resource "aws_api_gateway_method" "images_id_downloadurl_get" {
  rest_api_id   = aws_api_gateway_rest_api.this.id
  resource_id   = aws_api_gateway_resource.images_id_downloadurl.id
  http_method   = "GET"
  authorization = "NONE"

  request_parameters = {
    "method.request.path.proxy" = true,
  }
}
resource "aws_api_gateway_integration" "images_id_downloadurl_get" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.images_id_downloadurl.id
  http_method = aws_api_gateway_method.images_id_downloadurl_get.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda["images/{id}/downloadurl-GET"].invoke_arn
}

resource "aws_api_gateway_method_response" "images_id_downloadurl_get" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.images_id_downloadurl.id
  http_method = aws_api_gateway_method.images_id_downloadurl_get.http_method

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  status_code = "200"
}

resource "aws_api_gateway_integration_response" "images_id_downloadurl_get" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.images_id_downloadurl.id
  http_method = aws_api_gateway_method_response.images_id_downloadurl_get.http_method

  status_code = aws_api_gateway_method_response.images_id_downloadurl_get.status_code
  depends_on = [aws_api_gateway_integration.images_id_downloadurl_get]
}
