module "logging" {
  source = "./modules/logging"

  name          = local.logging_bucket_name
  bucket_to_log = module.frontend.frontend_bucket_name
}
