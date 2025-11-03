import * as cdk from "aws-cdk-lib/core";
import * as ecs from "aws-cdk-lib/aws-ecs";
import { SubnetType } from "aws-cdk-lib/aws-ec2";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { CfnOutput, Tags } from "aws-cdk-lib/core";
import { Construct } from "constructs";

import { VPCResources } from "./constructs/vpc";
import { EcrResources } from "./constructs/ecr";

export class EcsStack extends cdk.Stack {
  private ecsCluster: ecs.Cluster;
  private vpcResources: VPCResources;
  private ecrResources: EcrResources;
  private taskDefinition: ecs.FargateTaskDefinition;
  private ecsService: ecs.FargateService;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.vpcResources = new VPCResources(this, "MyVPCResources");
    this.ecrResources = new EcrResources(this, "MyEcrResources");

    this.createEcsCluster();
    this.createTaskDefinition();
    this.createEcsService();

    // Add tags
    this.addTags();

    // Add outputs
    this.addOutputs();
  }

  private createEcsCluster() {
    this.ecsCluster = new ecs.Cluster(this, "EcsCluster", {
      clusterName: "CDK-ECS-Cluster",
      vpc: this.vpcResources.vpc,
      containerInsightsV2: ecs.ContainerInsights.ENABLED,
    });
  }

  private createTaskDefinition() {
    this.taskDefinition = new ecs.FargateTaskDefinition(this, "FargateTaskDef");

    this.taskDefinition.addContainer("AppContainer", {
      containerName: "ECSContainer",
      image: ecs.ContainerImage.fromEcrRepository(
        this.ecrResources.repository,
        "latest"
      ),
      portMappings: [
        {
          containerPort: 80,
          protocol: ecs.Protocol.TCP,
        },
      ],
      logging: ecs.LogDriver.awsLogs({
        streamPrefix: "ECSAppLogs",
        logRetention: RetentionDays.ONE_DAY,
      }),
      healthCheck: {
        command: ["CMD-SHELL", "curl -f http://localhost/health || exit 1"],
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        retries: 3,
        startPeriod: cdk.Duration.seconds(60),
      },
    });

    Tags.of(this.taskDefinition).add("Type", "FargateTaskDefinition");
  }

  private createEcsService() {
    this.ecsService = new ecs.FargateService(this, "FargateService", {
      serviceName: "CDK-Fargate-Service",
      cluster: this.ecsCluster,
      taskDefinition: this.taskDefinition,
      vpcSubnets: {
        subnets: this.vpcResources.vpc.publicSubnets,
      },
      securityGroups: [this.vpcResources.httpSecurityGroup],
      assignPublicIp: true,
    });

    this.ecrResources.repository.grantPull(
      this.taskDefinition.obtainExecutionRole()
    );
  }

  private addTags() {
    Tags.of(this).add("CostCenter", "Engineering");
    Tags.of(this).add("CreatedBy", "AWS-CDK");

    Tags.of(this).add("CreatedDate", new Date().toISOString().split("T")[0]);
  }

  private addOutputs() {
    new CfnOutput(this, "VpcId", {
      value: this.vpcResources.vpc.vpcId,
      description: "The ID of the VPC",
      exportName: `${this.stackName}-VpcId`,
    });

    new CfnOutput(this, "PublicSubnetIds", {
      value: this.vpcResources.vpc.publicSubnets
        .map((subnet) => subnet.subnetId)
        .join(","),
      description: "The IDs of the public subnets",
      exportName: `${this.stackName}-PublicSubnetIds`,
    });

    new CfnOutput(this, "EcrRepositoryUri", {
      value: this.ecrResources.repository.repositoryUri,
      description: "The URI of the ECR Repository",
      exportName: `${this.stackName}-EcrRepositoryUri`,
    });

    new CfnOutput(this, "EcsClusterName", {
      value: this.ecsCluster.clusterName,
      description: "The name of the ECS Cluster",
      exportName: `${this.stackName}-EcsClusterName`,
    });
  }
}
