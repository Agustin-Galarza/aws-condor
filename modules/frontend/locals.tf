locals {
  filetypes = {
    "html" = "text/html",
    "css"  = "text/css",
    "js"   = "application/javascript",
    "json" = "application/json",
    "png"  = "image/png",
    "jpg"  = "image/jpeg",
    "jpeg" = "image/jpeg",
  }

  www_frontend_bucket_name = "www.${var.frontend_name}"
  reports_bucket_name      = "reports.${var.frontend_name}"


  file_with_type = flatten([
    for type, mime in local.filetypes : [
      for file in fileset("${var.frontend_folder}/", "**.${type}") : {
        name = file
        type = mime
      }
    ]
  ])

  logs_bucket_name = "${var.frontend_name}-logs"
}
