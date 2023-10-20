
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

  frontend_bucket_name = "galar.dev.condor.com"
  frontend_folder      = "./resources/frontend"

  logging_bucket_name = "galar.dev.condor-logs"

  security_groups = {
    "application" : {
      name        = "application_security_group"
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
    },
    "database" : {
      name        = "database_security_group"
      description = "Security group for the database layer"
      ingress_rules = [
        {
          description = "Allow TCP traffic from the lambdas",
          from_port   = 5432,
          to_port     = 5432,
          ip_protocol = "tcp",
          ip_range    = "10.0.10.0/23", # bit magic 😉 (10.0.10.0/24 and 10.0.11.0/24)
        },
        {
          description = "Allow all internal ingress traffic",
          from_port   = 0,
          to_port     = 0,
          ip_protocol = "-1",
          ip_range    = "0.0.0.0/0",
          self        = true
        }
      ]
      egress_rules = [
        {
          description = "Allow all internal egress traffic",
          from_port   = 0,
          to_port     = 0,
          ip_protocol = "-1",
          ip_range    = "0.0.0.0/0",
          self        = true
        }
      ]
    }
  }


  tags = {
    // TODO: Put tags
    type = "vpc"
  }
}
