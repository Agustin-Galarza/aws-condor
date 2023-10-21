variable "instance_count" {
  description = "amount of cluster instances to initialize"
  type        = number
  default     = 1
}

variable "availability_zones" {
  description = "List of AZs to use for cluster instances"
  type        = list(string)
}

variable "cluster_id" {
  description = "Cluster ID"
  type        = string
}

variable "database_name" {
  description = "Database name"
  type        = string
}

variable "master_credentials" {
  description = "Credentials for the master user"
  type = object({
    username = string
    password = string
  })
}

variable "security_group_ids" {
  description = "List of security group IDs to attach to cluster instances"
  type        = list(string)
}


variable "subnet_group_name" {
  description = "Name of the subnet group to use for the cluster"
  type        = string
}
