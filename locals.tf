
data "aws_availability_zones" "available" {
  state = "available"
}

locals {
  name = "main" // Estas cosas van como local o como variable? No son una transformacion, pero es medio raro ponerlo en un .env.
  // Por otro lado, en la doc oficial de terraform registry lo hacen como locals
  vpc_cidr = "10.0.0.0/16"
  azs      = slice(data.aws_availability_zones.available.names, 0, 2)

  private_subnets_names  = ["Application Primary", "Application Secondary"]
  database_subnets_names = ["Database Primary", "Database Secondary"]

  security_groups_prefix = "${local.name}-security-group"

  frontend_bucket_name = "dev.condor.com"
  frontend_folder      = "./resources/frontend"

  logging_bucket_name = "dev.condor-logs"


  tags = {
    // TODO: Put tags
    type = "vpc"
  }
}
