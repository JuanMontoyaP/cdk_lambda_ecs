data "aws_iam_policy_document" "gha_trust_policy" {
  statement {
    effect = "Allow"

    principals {
      type        = "Federated"
      identifiers = [var.identity_provider_arn]
    }

    actions = ["sts:AssumeRoleWithWebIdentity"]

    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values = [
        "repo:JuanMontoyaP/cdk_lambda_ecs:ref:refs/heads/*",
        "repo:JuanMontoyaP/cdk_lambda_ecs:ref:refs/tags/*",
        "repo:JuanMontoyaP/cdk_lambda_ecs:pull_request"
      ]
    }
  }
}

data "aws_iam_policy_document" "gha_cdk_policy" {
  statement {
    effect = "Allow"

    actions = [
      "ecr:BatchCheckLayerAvailability",
      "ecr:CompleteLayerUpload",
      "ecr:InitiateLayerUpload",
      "ecr:PutImage",
      "ecr:UploadLayerPart"
    ]

    resources = ["*"]
  }
}
