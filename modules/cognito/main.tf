resource "aws_cognito_user_pool" "userpool" {
  name = "condor-userpool"

  schema {
    name                     = "Email"
    attribute_data_type      = "String"
    mutable                  = true
    developer_only_attribute = false
  }

  email_configuration {
    email_sending_account = "COGNITO_DEFAULT"
  }

  auto_verified_attributes = ["email"]

  password_policy {
    minimum_length    = 6
    require_lowercase = false
    require_numbers   = false
    require_symbols   = false
    require_uppercase = false
  }

  username_attributes = ["email"]
  username_configuration {
    case_sensitive = true
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }
}

resource "aws_cognito_user_pool_client" "userpool_client" {
  name         = "condor-client"
  user_pool_id = aws_cognito_user_pool.userpool.id

  explicit_auth_flows = ["ALLOW_USER_SRP_AUTH", "ALLOW_REFRESH_TOKEN_AUTH", "ALLOW_USER_PASSWORD_AUTH"]

  generate_secret = false

  prevent_user_existence_errors = "LEGACY"

  refresh_token_validity = 1
  access_token_validity  = 1
  id_token_validity      = 1
  token_validity_units {
    access_token  = "hours"
    id_token      = "hours"
    refresh_token = "hours"
  }
}

resource "aws_cognito_user_pool_domain" "userpool_domain" {
  domain = "dev-galar-condor-com"
  # certificate_arn = aws_acm_certificate.cert.arn  # TODO: Add when merged with proyect, this should link to route 53
  user_pool_id = aws_cognito_user_pool.userpool.id
}

