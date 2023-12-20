module "dynamo" {
  source = "./modules/dynamo"

  name = "condor-main"

  billing_mode = {
    mode = "PAY_PER_REQUEST"
  }

  hash_key = {
    name = "PartitionKey"
    type = "S"
  }

  range_key = {
    name = "SortKey"
    type = "S"
  }
}
