module "cognito" {
  source = "./modules/cognito"
}

module "api_gateway" {
  source = "./modules/api_gateway"

  name        = "main"
  stage       = "dev"
  cognito_arn = module.cognito.cognito_arn
  authorizer = {
    name = "main"
    type = "COGNITO_USER_POOLS"
  }

  methods = [
    {
      path        = "login"
      http_method = "POST"
    },
    {
      path        = "logout"
      http_method = "POST"
    },
    {
      path        = "signup"
      http_method = "POST"
    },
    {
      path        = "reports"
      http_method = "OPTIONS"
    },
    {
      path        = "reports"
      http_method = "GET"
    },
    {
      path        = "reports"
      http_method = "POST"
    },
  ]
}
