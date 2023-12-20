module "cognito" {
  source = "./modules/cognito"
}

module "api_gateway" {
  source = "./modules/api_gateway"

  name        = "main"
  stage       = "dev"
  cognito_arn = module.cognito.arn
  authorizer = {
    name = "main"
    type = "COGNITO_USER_POOLS"
  }
  role_arn   = data.aws_iam_role.lab_role.arn
  account_id = data.aws_caller_identity.current.account_id

  methods = [
    {
      path = "reports"
      methods = [
        {
          name          = "reports_get"
          http_method   = "GET",
          handler       = "main.handler",
          zip_name      = "reports_get"
          env_variables = {}
        },
        {
          name          = "reports_post"
          http_method   = "POST",
          handler       = "main.handler",
          zip_name      = "reports_post"
          env_variables = {}
        }
      ]
    },
    {
      path = "groups"
      methods = [
        {
          name          = "groups_get"
          http_method   = "GET",
          handler       = "main.handler",
          zip_name      = "groups_get"
          env_variables = {}
        },
        {
          name          = "groups_post"
          http_method   = "POST",
          handler       = "main.handler",
          zip_name      = "groups_post"
          env_variables = {}
        }
      ]
    },
    {
      path = "users"
      methods = [
        {
          name          = "users_get"
          http_method   = "GET",
          handler       = "main.handler",
          zip_name      = "users_get"
          env_variables = {}
        },
        {
          name          = "users_post"
          http_method   = "POST",
          handler       = "main.handler",
          zip_name      = "users_post"
          env_variables = {}
        }
      ]
    },
    {
      path = "images"
      methods = [
        {
          name          = "images_get"
          http_method   = "GET",
          handler       = "main.handler",
          zip_name      = "images_get"
          env_variables = {}
        },
        {
          name          = "images_post"
          http_method   = "POST",
          handler       = "main.handler",
          zip_name      = "images_post"
          env_variables = {}
        }
      ]
    },

  ]
}
