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

  file_with_type = flatten([
    for type, mime in local.filetypes : [
      for file in fileset("${var.frontend_folder}/", "**.${type}") : {
        name = file
        type = mime
      }
    ]
  ])

}
