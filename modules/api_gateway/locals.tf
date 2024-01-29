locals {
  lab_role = "arn:aws:iam::${var.account_id}:role/LabRole"

  lambdas = [
    {
      name          = "users_get"
      http_method   = "GET"
      path          = "users"
      handler       = "main.handler"
      zip_name      = "users_get"
      env_variables = {}
    },
    {
      name          = "users_post"
      http_method   = "POST"
      path          = "users"
      handler       = "main.handler"
      zip_name      = "users_post"
      env_variables = {}
    },
    {
      name          = "users_username_get"
      http_method   = "GET"
      path          = "users/{username}"
      handler       = "main.handler"
      zip_name      = "users_username_get"
      env_variables = {}
    },
    {
      name          = "groups_get"
      http_method   = "GET"
      path          = "groups"
      handler       = "main.handler"
      zip_name      = "groups_get"
      env_variables = {}
    },
    {
      name          = "groups_post"
      http_method   = "POST"
      path          = "groups"
      handler       = "main.handler"
      zip_name      = "groups_post"
      env_variables = {}
    },
    {
      name          = "groups_groupname_get"
      http_method   = "GET"
      path          = "groups/{groupname}"
      handler       = "main.handler"
      zip_name      = "groups_groupname_get"
      env_variables = {}
    },
    {
      name          = "groups_groupname_addmember"
      http_method   = "POST"
      path          = "groups/{groupname}/addMember"
      handler       = "main.handler"
      zip_name      = "groups_groupname_addmember"
      env_variables = {}
    },
    //////
    {
      name          = "groups_groupname_reports_get"
      http_method   = "GET"
      path          = "groups/{groupname}/reports"
      handler       = "main.handler"
      zip_name      = "groups_groupname_reports_get"
      env_variables = {}
    },
    {
      name          = "reports_get"
      http_method   = "GET"
      path          = "reports"
      handler       = "main.handler"
      zip_name      = "reports_get"
      env_variables = {}
    },
    {
      name          = "reports_post"
      http_method   = "POST"
      path          = "reports"
      handler       = "main.handler"
      zip_name      = "reports_post"
      env_variables = {}
    },
  ]
}
