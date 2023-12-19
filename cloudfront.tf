module "cloudfront" {
  source = "./modules/cloudfront"

  s3_bucket_id                        = module.frontend.www_bucket
  website_bucket_regional_domain_name = module.frontend.frontend_bucket_domain_name
  aliases                             = [module.frontend.frontend_bucket_domain_name, module.frontend.www_bucket_domain_name]
  # certificate_arn                     = module.acm.certificate_arn
  api_gw_id    = module.api_gateway.api_gateway_id
  api_gw_stage = module.api_gateway.api_gateway_stage
  region       = data.aws_region.current.name

  s3_bucket_origin_id = module.frontend.www_bucket_rdn
  s3_bucket_arn       = module.frontend.www_bucket_arn
}
