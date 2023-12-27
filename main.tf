// Add cognito and cloudfront info to frontend .env
resource "null_resource" "generate_env_file" {
  provisioner "local-exec" {
    // TODO: Is "VITE_API_URL=${module.api_gateway.api_gateway_invoke_url}" ok?
    command = <<-EOT
      echo "VITE_API_URL=${module.api_gateway.api_gateway_invoke_url}" > ./frontend/condor/.env 
      echo "VITE_COGNITO_USER_POOL_ID=${module.cognito.user_pool_client_id}" >> ./frontend/condor/.env
      echo "VITE_COGNITO_CLIENT_ID=${module.cognito.id}" >> ./frontend/condor/.env
      echo "VITE_CLOUDFRONT_URL=${module.cloudfront.cloudfront_domain_name}" >> ./frontend/condor/.env
    EOT
  }
  depends_on = [
    module.api_gateway,
    module.cognito,
    module.cloudfront
  ]
}


// Build the application frontend and store it in the resources/frontend directory
data "external" "npm_build" {
  program = ["bash", "${path.module}/scripts/npm_build.sh"]

  depends_on = [
    null_resource.generate_env_file
  ]
}


// Build all services

module "frontend" {
  source          = "./modules/frontend"
  frontend_folder = local.frontend_folder
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
  source                              = "./modules/cloudfront"
  s3_bucket_id                        = module.frontend.frontend_bucket
  website_bucket_regional_domain_name = module.frontend.frontend_bucket_rdn
  # certificate_arn                     = module.acm.certificate_arn
  api_gw_id    = module.api_gateway.api_gateway_id
  api_gw_stage = module.api_gateway.api_gateway_stage
  region       = data.aws_region.current.name

  s3_bucket_origin_id = module.frontend.www_bucket_rdn
  s3_bucket_arn       = module.frontend.frontend_bucket_arn

  aliases = [
    local.frontend_bucket_name,
    local.www_bucket_name,
  ]
  depends_on = [module.frontend, module.acm]
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
module "acm" {
  source      = "./modules/acm"
  domain_name = local.frontend_bucket_name

  # depends_on = [module.route53]
}

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
    # s3 = {
    #   # interface endpoint
    #   service = "s3"
    #   tags    = { Name = "s3-vpc-endpoint" }
    # },
  }
  depends_on = []

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
