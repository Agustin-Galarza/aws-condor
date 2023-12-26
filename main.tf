
data "external" "npm_build" {
  program = ["bash", "${path.module}/npm_build.sh"]
}
