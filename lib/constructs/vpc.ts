import {
  IIpAddresses,
  IpAddresses,
  Vpc,
  SubnetType,
  SecurityGroup,
  Peer,
  Port,
} from "aws-cdk-lib/aws-ec2";
import { Tags } from "aws-cdk-lib/core";
import { Construct } from "constructs";

export class VPCResources extends Construct {
  public vpc: Vpc;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.createVpc("MyVPC", IpAddresses.cidr("10.0.0.0/16"));
    this.addSecurityGroup();

    Tags.of(this).add("Type", "Network-Infrastructure");
  }

  createVpc(vpcName: string, cidr: IIpAddresses) {
    this.vpc = new Vpc(this, vpcName, {
      ipAddresses: cidr,
      maxAzs: 2,
      natGateways: 0,
      createInternetGateway: true,
      restrictDefaultSecurityGroup: false,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: "PublicSubnet",
          subnetType: SubnetType.PUBLIC,
          mapPublicIpOnLaunch: true,
        },
      ],
    });

    // Add specific tags to VPC
    Tags.of(this.vpc).add("Name", "CDK-VPC");
  }

  addSecurityGroup() {
    let httpSecurityGroup = new SecurityGroup(this, "HttpSecurityGroup", {
      vpc: this.vpc,
      securityGroupName: "HttpSecurityGroup",
      description: "Allow HTTP traffic to EC2 instances",
      allowAllOutbound: true,
    });

    httpSecurityGroup.addIngressRule(
      Peer.anyIpv4(),
      Port.tcp(80),
      "Allow HTTP traffic from anywhere"
    );
  }
}
