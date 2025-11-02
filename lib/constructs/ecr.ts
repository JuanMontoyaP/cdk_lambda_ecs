import { Repository } from "aws-cdk-lib/aws-ecr";
import { DockerImageAsset } from "aws-cdk-lib/aws-ecr-assets";
import { Tags, RemovalPolicy, Duration } from "aws-cdk-lib/core";
import { Construct } from "constructs";

export class EcrResources extends Construct {
  public repository: Repository;
  public dockerImage: DockerImageAsset;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.createEcrRepository("cdk-lambda-ecs-repo");

    Tags.of(this).add("Type", "Repository");
  }

  createEcrRepository(repositoryName: string) {
    this.repository = new Repository(this, "EcrRepository", {
      repositoryName,
      imageScanOnPush: true,
      emptyOnDelete: true,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    this.repository.addLifecycleRule({
      description: "keep last 5 images",
      maxImageCount: 5,
    });

    this.repository.addLifecycleRule({
      description: "Remove images older than 10 days",
      maxImageAge: Duration.days(10),
    });
  }
}
