IMAGE?=cdk-lambda-ecs-repo
VERSION?=dev
AWS_ACCOUNT_ID?=$(shell aws --profile JuanP sts get-caller-identity --query Account --output text)
AWS_REGION?=us-west-1
PLATFORM?=linux/amd64

session:
	aws --profile JuanP ecr get-login-password --region ${AWS_REGION} | \
		docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

build:
	docker build --platform ${PLATFORM} -t ${IMAGE}:${VERSION} .

run:
	docker run --rm -d -p 80:80 --name ${IMAGE} ${IMAGE}:${VERSION}

tag: build
	docker tag ${IMAGE}:${VERSION} \
		${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${IMAGE}:${VERSION}

publish: session tag
	docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${IMAGE}:${VERSION}
