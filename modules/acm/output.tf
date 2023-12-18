output "certificate_arn" {
  description = "Certificate amazon resource number"
  value       = aws_acm_certificate.this.arn
}

output "domain_validation_options" {
  value = aws_acm_certificate.this.domain_validation_options
}