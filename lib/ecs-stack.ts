import * as cdk from "aws-cdk-lib/core";
import * as ecs from "aws-cdk-lib/aws-ecs";
import { CfnOutput, Tags } from "aws-cdk-lib/core";
import { Construct } from "constructs";

import { VPCResources } from "./constructs/vpc";
import { EcrResources } from "./constructs/ecr";

export class EcsStack extends cdk.Stack {
  private ecsCluster: ecs.Cluster;
  private vpcResources: VPCResources;
  private ecrResources: EcrResources;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.vpcResources = new VPCResources(this, "MyVPCResources");
    this.ecrResources = new EcrResources(this, "MyEcrResources");

    this.createEcsCluster();

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
  }
}
