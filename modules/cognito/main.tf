resource "aws_cognito_user_pool" "this" {
  name = local.name

  email_verification_subject = "Your Verification Code"
  email_verification_message = "Please use the following code: {####}"
  alias_attributes           = local.alias_attributes
  auto_verified_attributes   = local.auto_verified_attributes

  password_policy {
    minimum_length    = local.password.minimum_length
    require_lowercase = local.password.require_lowercase
    require_numbers   = local.password.require_numbers
    require_symbols   = local.password.require_symbols
    require_uppercase = local.password.require_uppercase
  }

  username_configuration {
    case_sensitive = local.username_configuration.case_sensitive
  }

  schema {
    attribute_data_type      = local.email_schema.attribute_data_type
    developer_only_attribute = local.email_schema.developer_only_attribute
    mutable                  = local.email_schema.mutable
    name                     = local.email_schema.name
    required                 = local.email_schema.required

    string_attribute_constraints {
      min_length = local.email_schema.string_attribute_constraints.min_length
      max_length = local.email_schema.string_attribute_constraints.max_length
    }
  }

  schema {
    attribute_data_type      = local.user_schema.attribute_data_type
    developer_only_attribute = local.user_schema.developer_only_attribute
    mutable                  = local.user_schema.mutable
    name                     = local.user_schema.name
    required                 = local.user_schema.required

    string_attribute_constraints {
      min_length = local.user_schema.string_attribute_constraints.min_length
      max_length = local.user_schema.string_attribute_constraints.max_length
    }
  }

  provisioner "local-exec" {
    command = <<-EOT
      echo "VITE_COGNITO_CLIENT_ID=${aws_cognito_user_pool.this.id}" >> ./frontend/condor/.env
    EOT
  }
}

resource "aws_cognito_user_pool_client" "this" {
  name                = local.client_name
  explicit_auth_flows = local.client_explicit_auth_flows

  user_pool_id = aws_cognito_user_pool.this.id


  provisioner "local-exec" {
    command = <<-EOT
      echo "VITE_COGNITO_USER_POOL_ID=${aws_cognito_user_pool.this.idaws_cognito_user_pool_client.this.id}" >> ./frontend/condor/.env
    EOT
  }
}


