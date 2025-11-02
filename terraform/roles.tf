resource "aws_iam_role" "gha_cdk_ecs_role" {
  name               = "GHA_CDK_ECS_Role"
  assume_role_policy = data.aws_iam_policy_document.gha_trust_policy.json
}

resource "aws_iam_policy" "gha_cdk_policy" {
  name   = "GHA_CDK_Policy"
  policy = data.aws_iam_policy_document.gha_cdk_policy.json
}

resource "aws_iam_role_policy_attachment" "gha_cdk_policy_attachment" {
  role       = aws_iam_role.gha_cdk_ecs_role.name
  policy_arn = aws_iam_policy.gha_cdk_policy.arn
}
