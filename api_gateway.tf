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

  methods = [
    {
      path        = "login"
      http_method = "POST"
      handler    = "login.handler"
      env_variables = {
        "COGNITO_CLIENT_ID"    = module.cognito.user_pool_client_id
      }
    },
    {
      path        = "logout"
      http_method = "POST"
      handler    = "main.handler"
      env_variables = {}
    },
    {
      path        = "signup"
      http_method = "POST"
      handler    = "main.handler"
      env_variables = {}
    },
    {
      path        = "reports"
      http_method = "GET"
      handler    = "main.handler"
      env_variables = {}
    },
    {
      path        = "reports"
      http_method = "POST"
      handler    = "main.handler"
      env_variables = {}
    },
  ]
}
