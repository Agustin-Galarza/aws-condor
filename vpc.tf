module "vpc" {
  source = "terraform-aws-modules/vpc/aws"

  name = local.name

  azs                   = local.azs
  private_subnets       = [for key, _ in local.azs : cidrsubnet(local.vpc_cidr, 8, key + 10)]
  database_subnets      = [for key, _ in local.azs : cidrsubnet(local.vpc_cidr, 8, key + 20)]
  private_subnet_names  = local.private_subnets_names
  database_subnet_names = local.database_subnets_names

  database_subnet_group_name = "database-subnet-group"


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
  security_group_rules = {
    // TODO: define
  }


  endpoints = {
    sns = {
      service   = "sns"
      subnet_id = module.vpc.private_subnets
    }
    dynamodb = {
      # gateway endpoint
      service         = "dynamodb"
      route_table_ids = ["rt-12322456", "rt-43433343", "rt-11223344"]
    },
  }
}

module "security_group" {
  source = "./modules/security_group"

  for_each = local.security_groups

  name          = "${each.key}_security_group"
  vpc_id        = module.vpc.vpc_id
  description   = each.value.description
  ingress_rules = each.value.ingress_rules
  egress_rules  = each.value.egress_rules
}
