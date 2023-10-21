module "vpc" {
  source = "terraform-aws-modules/vpc/aws"

  name = local.name

  azs                   = local.azs
  private_subnets       = [for key, _ in local.azs : cidrsubnet(local.vpc_cidr, 8, key + 10)]
  database_subnets      = [for key, _ in local.azs : cidrsubnet(local.vpc_cidr, 8, key + 20)]
  private_subnet_names  = local.private_subnets_names
  database_subnet_names = local.database_subnets_names


  enable_vpn_gateway  = false
  enable_nat_gateway  = false
  enable_dhcp_options = false

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
  }

}

module "application_security_group" {
  source = "./modules/security_group"

  name = "application_security_group"

  vpc_id = module.vpc.vpc_id
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
  egress_rules = [
    {
      description = "Allow traffic to the database",
      to_port     = 5432,
      ip_protocol = "tcp",
      ip_range    = "10.0.20.0/23", # (10.0.20.0/24 and 10.0.21.0/24)
    }
  ]
}

module "database_security_group" {
  source = "./modules/security_group"

  name         = "database_security_group"
  vpc_id = module.vpc.vpc_id

  description  = "Security group for the dynamodb layer"
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
