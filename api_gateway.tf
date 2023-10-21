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
  role_arn = data.aws_iam_role.lab_role.arn

  methods = [
    {
      path = "reports"
      methods = [
        {
          name          = "get_all_reports"
          http_method   = "GET",
          handler       = "main.handler",
          zip_name      = "reports-get"
          env_variables = {}
        },
        {
          name          = "create_report"
          http_method   = "POST",
          handler       = "main.handler",
          zip_name      = "reports-post"
          env_variables = {}
        }
      ]
    },
    #    {
    #      path = "{id}"
    #      methods = [
    #        {
    #          name          = "get_id"
    #          http_method   = "GET",
    #          handler       = "main.handler",
    #          env_variables = {}
    #        },
    #        {
    #          name          = "update_id"
    #          http_method   = "PUT",
    #          handler       = "main.handler",
    #          env_variables = {}
    #        },
    #        {
    #          name          = "delete_id"
    #          http_method   = "DELETE",
    #          handler       = "main.handler",
    #          env_variables = {}
    #        }
    #      ]
    #    }
  ]
}
