locals {
  name                     = "this"
  alias_attributes         = ["email"]
  auto_verified_attributes = ["email"]

  password = {
    minimum_length    = 6
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
    require_uppercase = true
  }

  username_configuration = {
    case_sensitive = false
  }

  email_schema = {
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    name                     = "email"
    required                 = true

    string_attribute_constraints = {
      min_length = 4
      max_length = 256
    }
  }

  user_schema = {
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    name                     = "name"
    required                 = true

    string_attribute_constraints = {
      min_length = 3
      max_length = 256
    }
  }

  client_name                = "this"
  client_explicit_auth_flows = ["ALLOW_USER_PASSWORD_AUTH", "ALLOW_REFRESH_TOKEN_AUTH"]

}
