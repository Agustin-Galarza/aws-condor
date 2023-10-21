module "rds_proxy" {
  source = "./modules/rds_proxy"

  name = "rds-proxy"

  security_group_ids = [module.security_group["database"].id]

  subnet_ids = module.vpc.database_subnets

  role_arn = data.aws_iam_role.lab_role.arn
}

module "rds_cluster" {
  source = "./modules/rds"

  cluster_id     = "rds-cluster"
  instance_count = 3

  availability_zones = local.azs

  database_name     = "main"
  subnet_group_name = module.vpc.database_subnet_group_name

  master_credentials = {
    username = "postgres",
    password = "postgres"
  }

  security_group_ids = [module.security_group["database"].id]
}
