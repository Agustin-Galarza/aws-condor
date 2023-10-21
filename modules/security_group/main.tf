resource "aws_security_group" "this" {
  name        = var.name
  description = var.description
  vpc_id      = var.vpc_id
}

resource "aws_vpc_security_group_ingress_rule" "this" {
  security_group_id = aws_security_group.this.id

  count = length(var.ingress_rules)

  ip_protocol                  = var.ingress_rules[count.index].ip_protocol
  description                  = var.ingress_rules[count.index].description
  from_port                    = var.ingress_rules[count.index].from_port
  to_port                      = var.ingress_rules[count.index].to_port
  cidr_ipv4                    = var.ingress_rules[count.index].ip_range != "" ? var.ingress_rules[count.index].ip_range : null
  referenced_security_group_id = var.ingress_rules[count.index].self ? aws_security_group.this.id : null
}

resource "aws_vpc_security_group_egress_rule" "this" {
  security_group_id = aws_security_group.this.id

  count = length(var.egress_rules)

  ip_protocol                  = var.egress_rules[count.index].ip_protocol
  description                  = var.egress_rules[count.index].description
  from_port                    = var.egress_rules[count.index].from_port
  to_port                      = var.egress_rules[count.index].to_port
  cidr_ipv4                    = var.egress_rules[count.index].ip_range != "" ? var.egress_rules[count.index].ip_range : null
  referenced_security_group_id = var.egress_rules[count.index].self ? aws_security_group.this.id : null
}
