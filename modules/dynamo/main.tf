resource "aws_dynamodb_table" "this" {
  name           = var.name
  billing_mode   = var.billing_mode.mode
  read_capacity  = var.billing_mode.mode == "PROVISIONED" ? var.billing_mode.read_capacity : null
  write_capacity = var.billing_mode.mode == "PROVISIONED" ? var.billing_mode.write_capacity : null
  hash_key       = var.hash_key.name
  range_key      = var.range_key.name

  attribute {
    name = var.hash_key.name
    type = var.hash_key.type
  }

  attribute {
    name = var.range_key.name
    type = var.range_key.type
  }

  attribute {
    name = "Type"
    type = "S"
  }

  global_secondary_index {
    name            = "TypeIndex"
    hash_key        = "Type"
    range_key       = "SortKey"
    write_capacity  = 10
    read_capacity   = 10
    projection_type = "ALL"
  }

}
