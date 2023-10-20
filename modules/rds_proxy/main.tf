resource "aws_db_proxy" "proxy" {
  name                   = "proxy"
  debug_logging          = false
  engine_family          = "POSTGRESQL"
  idle_client_timeout    = 1800
  require_tls            = true
  role_arn               = data.aws_iam_role.lambda.arn
  vpc_security_group_ids = [aws_security_group.allow_tcp.id] # TODO: check with security group module
  vpc_subnet_ids         = [vpc.private_subnets] # TODO: ids?

  auth {
    # auth_scheme = "SECRETS"
    # description = "example"
    # iam_auth    = "DISABLED"
    # secret_arn  = aws_secretsmanager_secret.example.arn
  }

  tags = {
    Name = "example"
    Key  = "value"
  }
}