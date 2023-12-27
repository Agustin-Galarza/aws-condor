locals {
  name = "main"

  vpc_cidr = "10.0.0.0/16"
  azs      = slice(data.aws_availability_zones.available.names, 0, 2)

  private_subnets_names  = ["Application Primary", "Application Secondary"]
  database_subnets_names = ["Database Primary", "Database Secondary"]

  security_groups_prefix = "${local.name}-security-group"

  frontend_bucket_name = "condor.abenve.ar"
  www_bucket_name      = "www.condor.abenve.ar"
  frontend_folder      = "./resources/frontend/condor/dist"


  tags = {
    type = "vpc"
  }
}


