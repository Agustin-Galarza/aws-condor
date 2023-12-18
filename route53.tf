module "route53" {
  source      = "./modules/route53"
  domain_name = module.frontend.frontend_bucket_domain_name
  cloudfront  = module.cloudfront.cloudfront_distribution
}