variable "name" {
  description = "Table name"
  type = string
}

variable "billing_mode" {
  type = object({
    mode = string
    read_capacity = optional(number, 1)
    write_capacity = optional(number, 1)
  })
}


variable "hash_key" {
  type = object({
    name = string
    type = string
  })
}

variable "range_key" {
  type = object({
    name = string
    type = string
  })
}



