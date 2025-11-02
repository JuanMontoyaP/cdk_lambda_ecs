terraform {
  required_version = "~> 1.13.4"

  backend "s3" {
    bucket       = "tf-labs-state-juan"
    key          = "cdk_lambda_ecs/terraform.tfstate"
    region       = "us-east-1"
    use_lockfile = true
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0.0"
    }
  }
}

provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile

  default_tags {
    tags = {
      Project = "cdk_lambda_ecs"
    }
  }
}
