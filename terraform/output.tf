output "role_arn" {
  description = "The ARN of the IAM role"
  value       = aws_iam_role.gha_cdk_ecs_role.arn
}
