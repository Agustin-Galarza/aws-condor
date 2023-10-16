module "frontend" {
  source = "./modules/frontend"

  frontend_name   = local.frontend_bucket_name
  frontend_folder = local.frontend_folder
}
