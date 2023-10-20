resource "aws_security_group" "allow_tcp" {
  name = "allow_tcp"
  description = "Allow TCP inbound traffic"
  vpc_id = vpc.vpc_id # TODO: is this ok?

  ingress {
    description = "Allow TCP from VPC"
    from_port = 0
    to_port = 5432
    protocol = "tcp"
    cidr_blocks = [] # TODO: what goes in here?
  }

  # TODO: should we specify egress?
  egress {
    description = "Allow ALL egress traffic"
    from_port = 0
    to_port = 0
    protocol = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}