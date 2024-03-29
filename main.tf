// Add cognito and cloudfront info to frontend .env
resource "null_resource" "generate_env_file" {
  provisioner "local-exec" {
    // TODO: Is "VITE_API_URL=${module.api_gateway.api_gateway_invoke_url}" ok?
    command = <<-EOT
      echo "VITE_API_URL=${module.api_gateway.api_gateway_invoke_url}" > ${local.frontend_folder}/.env ; 
      echo "VITE_COGNITO_USER_POOL_ID=${module.cognito.user_pool_id}" >> ${local.frontend_folder}/.env ;
      echo "VITE_COGNITO_CLIENT_ID=${module.cognito.user_pool_client_id}" >> ${local.frontend_folder}/.env ;
      echo "VITE_CLOUDFRONT_URL=${module.cloudfront.cloudfront_domain_name}" >> ${local.frontend_folder}/.env ;
    EOT
  }
  depends_on = [
    module.api_gateway,
    module.cognito,
    module.cloudfront
  ]
}


// Build the application frontend and store it in the resources/frontend directory
resource "null_resource" "build_frontend" {
  provisioner "local-exec" {
    command = "${path.module}/scripts/npm_build.sh"
  }
  depends_on = [
    null_resource.generate_env_file
  ]


}

resource "aws_s3_object" "data" {
  for_each = { for file in local.file_with_type : file.name => file }

  bucket        = module.frontend.frontend_bucket_id
  key           = each.value.name
  source        = "${local.frontend_build_folder}/${each.value.name}"
  etag          = filemd5("${local.frontend_build_folder}/${each.value.name}")
  content_type  = each.value.type
  storage_class = "STANDARD"

  depends_on = [
    module.frontend,
    null_resource.build_frontend
  ]
}



// Build all services

module "frontend" {
  source    = "./modules/frontend"
  base_name = local.frontend_bucket_name
}

module "dynamo" {
  source = "./modules/dynamo"
  name   = "condor-main"
  billing_mode = {
    mode = "PAY_PER_REQUEST"
  }
  hash_key = {
    name = "PartitionKey"
    type = "S"
  }
  range_key = {
    name = "SortKey"
    type = "S"
  }
}

module "cloudfront" {
  source = "./modules/cloudfront"

  static_website = {
    id                  = module.frontend.frontend_bucket_id
    domain_name         = module.frontend.frontend_bucket_rdn
    bucket_arn          = module.frontend.frontend_bucket_arn
    default_root_object = "index.html"
  }
  # certificate_arn = module.acm.certificate_arn
  api_gw = {
    id         = module.api_gateway.api_gateway_id
    stage      = module.api_gateway.api_gateway_stage
    invoke_url = module.api_gateway.api_gateway_invoke_url
  }
  region = data.aws_region.current.name

  aliases = [
    local.frontend_bucket_name,
    local.www_bucket_name,
  ]

  frontend_folder = local.frontend_folder

  depends_on = [
    module.frontend,
    # module.acm
  ]
}


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
      name          = "users_id_get"
      http_method   = "GET"
      path          = "users/{id}"
      handler       = "main.handler"
      zip_name      = "users_id_get"
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
      env_variables = {
        # "CLOUDFRONT_DOMAIN_NAME" = module.cloudfront.cloudfront_domain_name
      }
    },
    {
      name          = "reports_id_get"
      http_method   = "GET"
      path          = "reports/{reportId}"
      handler       = "main.handler"
      zip_name      = "reports_id_get"
      env_variables = {}
    },
    {
      name          = "images_id_get"
      http_method   = "GET"
      path          = "images/{id}"
      handler       = "main.handler"
      zip_name      = "images_id_get"
      env_variables = {}
    },
    {
      name          = "images_id_downloadurl_get"
      http_method   = "GET"
      path          = "images/{id}/downloadurl"
      handler       = "main.handler"
      zip_name      = "images_id_downloadurl_get"
      env_variables = {}
    },
  ]


  layers_arns = [
    aws_lambda_layer_version.dynamo_layer.arn,
    aws_lambda_layer_version.sns_layer.arn,
    aws_lambda_layer_version.requests_layer.arn,
    aws_lambda_layer_version.responses_layer.arn,
    aws_lambda_layer_version.s3_layer.arn,
  ]
}

resource "aws_lambda_layer_version" "dynamo_layer" {
  filename   = "./resources/lambda_sources/dynamo.zip"
  layer_name = "dynamo"

  compatible_runtimes = ["nodejs16.x", "nodejs18.x"]
}

resource "aws_lambda_layer_version" "sns_layer" {
  filename   = "./resources/lambda_sources/sns.zip"
  layer_name = "sns"

  compatible_runtimes = ["nodejs16.x", "nodejs18.x"]
}

resource "aws_lambda_layer_version" "requests_layer" {
  filename   = "./resources/lambda_sources/requests.zip"
  layer_name = "requests"

  compatible_runtimes = ["nodejs16.x", "nodejs18.x"]
}

resource "aws_lambda_layer_version" "responses_layer" {
  filename   = "./resources/lambda_sources/responses.zip"
  layer_name = "responses"

  compatible_runtimes = ["nodejs16.x", "nodejs18.x"]
}

resource "aws_lambda_layer_version" "s3_layer" {
  filename   = "./resources/lambda_sources/s3.zip"
  layer_name = "s3"

  compatible_runtimes = ["nodejs16.x", "nodejs18.x"]
}




# module "acm" {
#   source      = "./modules/acm"
#   domain_name = local.frontend_bucket_name
#   alternative_domain_name = local.alternative_bucket_name
#   # depends_on = [module.route53]
# }

module "sns" {
  source  = "terraform-aws-modules/sns/aws"
  version = "5.3.0"

  name = "Reports"

  topic_policy = <<EOF
  {
    "Version": "2012-10-17",
    "Id": "MySNSPolicy",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": "*",
        "Action": "SNS:GetTopicAttributes",
        "Resource": "*"
      }
    ]
  }
  EOF
}

module "route53" {
  source      = "./modules/route53"
  domain_name = local.frontend_bucket_name
  cloudfront  = module.cloudfront.cloudfront_distribution
}


module "vpc" {
  source = "terraform-aws-modules/vpc/aws"

  name = local.name

  azs                  = local.azs
  private_subnets      = [for key, _ in local.azs : cidrsubnet(local.vpc_cidr, 8, key + 10)]
  private_subnet_names = local.private_subnets_names

  enable_vpn_gateway  = false
  enable_nat_gateway  = false
  enable_dhcp_options = false

  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = local.tags
}

module "vpc_endpoints" {
  source = "terraform-aws-modules/vpc/aws//modules/vpc-endpoints"

  vpc_id = module.vpc.vpc_id

  create_security_group      = true
  security_group_name_prefix = local.security_groups_prefix
  security_group_description = "VPC security group"


  endpoints = {
    sns = {
      service   = "sns"
      subnet_id = module.vpc.private_subnets
    }
    dynamodb = {
      service         = "dynamodb"
      service_type    = "Gateway"
      route_table_ids = flatten([module.vpc.private_route_table_ids])
      policy          = data.aws_iam_policy_document.dynamodb_endpoint_policy.json
    },
    s3 = {
      # interface endpoint
      service = "s3"
      tags    = { Name = "s3-vpc-endpoint" }
    },
  }
  depends_on = []

}

module "files_bucket" {

  force_destroy = true
  source        = "terraform-aws-modules/s3-bucket/aws"
  bucket_prefix = "files-"
  acl = "private"

  control_object_ownership = true
  object_ownership         = "ObjectWriter"

  server_side_encryption_configuration = {
    rule = {
      apply_server_side_encryption_by_default = {
        sse_algorithm = "AES256"
      }
    }
  }

  cors_rule = [{
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE", "HEAD"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
]
}

module "application_security_group" {
  source = "./modules/security_group"

  name = "application_security_group"

  vpc_id      = module.vpc.vpc_id
  description = "Security group for the application layer"
  ingress_rules = [
    {
      description = "Allow HTTPS traffic the lambdas",
      from_port   = 443,
      to_port     = 443,
      ip_protocol = "tcp",
      ip_range    = "0.0.0.0/0",
    },
  ]
  egress_rules = []
}

module "database_security_group" {
  source = "./modules/security_group"

  name   = "database_security_group"
  vpc_id = module.vpc.vpc_id

  description   = "Security group for the dynamodb layer"
  ingress_rules = []
  egress_rules = [
    {
      description    = "Allow traffic from the application layer",
      from_port      = 443,
      to_port        = 443,
      ip_protocol    = "tcp",
      prefix_list_id = module.vpc_endpoints.endpoints["dynamodb"].prefix_list_id
    }
  ]

  depends_on = [module.vpc_endpoints, module.vpc]
}
