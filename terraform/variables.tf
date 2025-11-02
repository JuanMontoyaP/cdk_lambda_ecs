# Variables for AWS account configuration
variable "aws_region" {
  description = "The AWS region to deploy resources in"
  type        = string
  default     = "us-west-1"
}

variable "aws_profile" {
  description = "The AWS profile to use for authentication"
  type        = string
}

variable "identity_provider_arn" {
  description = "The ARN of the identity provider"
  type        = string
  validation {
    condition     = can(regex("^arn:aws:iam::[0-9]{12}:oidc-provider/.+$", var.identity_provider_arn))
    error_message = "The identity_provider_arn must be a valid AWS IAM OIDC provider ARN."
  }
}

