resource "aws_db_proxy" "proxy" {
  name                   = "proxy"
  debug_logging          = false
  engine_family          = "POSTGRESQL"
  idle_client_timeout    = 1800
  require_tls            = true
  role_arn               = var.role_arn
  vpc_security_group_ids = [var.security_group_id]
  vpc_subnet_ids         = var.subnet_ids

  auth {}

  tags = {}
}
