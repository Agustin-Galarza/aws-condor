resource "aws_db_proxy" "proxy" {
  name                   = var.name
  debug_logging          = false
  engine_family          = "POSTGRESQL"
  idle_client_timeout    = 1800
  require_tls            = true
  role_arn               = var.role_arn
  vpc_security_group_ids = var.security_group_ids
  vpc_subnet_ids         = var.subnet_ids


  auth {
    description = "RDS Proxy cluster auth"
    iam_auth    = "DISABLED"
    secret_arn  = aws_secretsmanager_secret.this.arn
  }



}

// TODO: Investigar si usamos KMS
resource "aws_secretsmanager_secret" "this" {
  name = "rds-proxy-secret"

}
