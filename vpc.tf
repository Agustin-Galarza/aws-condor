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
  security_group_rules = {
    // TODO: define
  }


  endpoints = {
    // s3 = {} TODO: Investigar si necesitamos esto para subir fotos y videos desde una lambda al s3 o si hay otra forma de darle acceso temporal al usuario que quiere subir algo al s3 para que lo haga de una
    sns = {
      service   = "sns"
      subnet_id = module.vpc.private_subnets
    }
  }
}
