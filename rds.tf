module "rds_proxy" {
  source = "./modules/rds_proxy"

  name = "rds-proxy"

  security_group_id = module.security_group["database"].id

  subnet_ids = module.vpc.database_subnets

  role_arn = data.aws_iam_role.lab_role.arn
}

module "rds_cluster" {
  source = "./modules/rds"

  cluster_id     = "rds_cluster"
  instance_count = 3

  availability_zones = ["us-east-1a", "us-east-1b"]

  database_name = "main"

  master_credentials = {
    username = "postgres",
    password = "postgres"
  }

  security_group_ids = [module.security_group["database"].id]
}