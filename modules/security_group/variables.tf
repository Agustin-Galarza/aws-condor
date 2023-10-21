
variable "name" {
  type        = string
  description = "The security group's name"
}

variable "description" {
  type        = string
  description = "A description for the security group"
  default     = ""
}

variable "vpc_id" {
  type        = string
  description = "The ID of the VPC"
}

variable "ingress_rules" {
  description = "A list of ingress rules to apply to the security group"
  type = list(object({
    description : optional(string),
    from_port : optional(number, 0),
    to_port : optional(number, 0),
    ip_protocol : string,
    ip_range : optional(string, ""),
    prefix_list_id: optional(string),
    self : optional(bool, false)
  }))
}

variable "egress_rules" {
  description = "A list of egress rules to apply to the security group"
  type = list(object({
    description : optional(string),
    from_port : optional(number, 0),
    to_port : optional(number, 0),
    ip_protocol : string,
    ip_range : optional(string, ""),
    prefix_list_id: optional(string),
    self : optional(bool, false)
  }))
}

