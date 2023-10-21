resource "aws_rds_cluster_instance" "cluster_instances" {
  count                = var.instance_count
  identifier           = "aurora-cluster-${count.index}"
  cluster_identifier   = aws_rds_cluster.default.id
  db_subnet_group_name = var.subnet_group_name
  instance_class       = "db.r4.large"
  engine               = aws_rds_cluster.default.engine
  engine_version       = aws_rds_cluster.default.engine_version

  tags = {
    type = "rds instance"
  }
}

resource "aws_rds_cluster" "default" {
  cluster_identifier     = var.cluster_id
  engine                 = "aurora-postgresql"
  availability_zones     = var.availability_zones
  db_subnet_group_name   = var.subnet_group_name
  database_name          = var.database_name
  master_username        = var.master_credentials.username
  master_password        = var.master_credentials.password
  vpc_security_group_ids = var.security_group_ids

  tags = {
    type = "rds cluster"
  }
}
