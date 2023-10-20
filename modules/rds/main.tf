resource "aws_rds_cluster_instance" "cluster_instances" {
  count              = 2
  identifier         = "aurora-cluster-${count.index}"
  cluster_identifier = aws_rds_cluster.default.id
  instance_class     = "db.r4.large"
  engine             = aws_rds_cluster.default.engine
  engine_version     = aws_rds_cluster.default.engine_version
}

resource "aws_rds_cluster" "default" {
  cluster_identifier = "aurora-cluster-demo"
  engine             = "aurora-postgresql"
  availability_zones = ["us-east-1a", "us-east-1b", "us-east-1c"]
  database_name      = "mydb"
  master_username    = "foo"
  master_password    = "barbut8chars"
}