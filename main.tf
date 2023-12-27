// Add cognito and cloudfront info to frontend .env
resource "null_resource" "generate_env_file" {
  provisioner "local-exec" {
    // TODO: Is "VITE_API_URL=${module.api_gateway.api_gateway_invoke_url}" ok?
    command = <<-EOT
      echo "VITE_API_URL=${module.api_gateway.api_gateway_invoke_url}" > ./frontend/condor/.env 
      echo "VITE_COGNITO_USER_POOL_ID=${module.cognito.user_pool_client_id}" >> ./frontend/condor/.env
      echo "VITE_COGNITO_CLIENT_ID=${module.cognito.id}" >> ./frontend/condor/.env
      echo "VITE_CLOUDFRONT_URL=${module.cloudfront.cloudfront_domain_name}" >> ./frontend/condor/.env
    EOT
  }
  depends_on = [
    module.api_gateway,
    module.cognito,
    module.cloudfront
  ]
}


// Build the application frontend and store it in the resources/frontend directory
data "external" "npm_build" {
  program = ["bash", "${path.module}/scripts/npm_build.sh"]

  depends_on = [
    null_resource.generate_env_file
  ]
}
