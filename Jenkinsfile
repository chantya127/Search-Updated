pipeline {
    agent any

    environment {
        AWS_REGION = "ap-south-1"
        ACCOUNT_ID = "987988471012"
        ECR_REPO = "fastify-api"
        CLUSTER_NAME = "fastify-cluster"
        SERVICE_NAME = "fastify-task-service-1og2tft0"
        TASK_FAMILY = "fastify-task"
        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main', 
                    url: 'https://github.com/chantya127/Search-Updated.git'
            }
        }

        stage('Login to ECR') {
            steps {
                sh '''
                aws ecr get-login-password --region $AWS_REGION | \
                docker login --username AWS --password-stdin \
                $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
                '''
            }
        }

        stage('Build & Push Docker Image') {
            steps {
                sh '''
                docker build -t $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO:$IMAGE_TAG --push .
                '''
            }
        }

        stage('Register New Task Definition') {
            steps {
                script {
                    env.NEW_TASK_DEF_ARN = sh(returnStdout: true, script: '''
                    TASK_DEF=$(aws ecs describe-task-definition \
                        --task-definition $TASK_FAMILY \
                        --region $AWS_REGION)

                    NEW_TASK_DEF=$(echo $TASK_DEF | jq --arg IMAGE "$ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO:$IMAGE_TAG" \
                    '.taskDefinition |
                     .containerDefinitions[0].image=$IMAGE |
                     del(.taskDefinitionArn,.revision,.status,.requiresAttributes,.compatibilities,.registeredAt,.registeredBy)')

                    echo $NEW_TASK_DEF > new-task-def.json

                    NEW_ARN=$(aws ecs register-task-definition \
                        --region $AWS_REGION \
                        --cli-input-json file://new-task-def.json \
                        --query 'taskDefinition.taskDefinitionArn' \
                        --output text)

                    echo $NEW_ARN
                    ''').trim()
                }
            }
        }

        stage('Deploy to ECS') {
            steps {
                sh '''
                aws ecs update-service \
                  --cluster $CLUSTER_NAME \
                  --service $SERVICE_NAME \
                  --task-definition $NEW_TASK_DEF_ARN \
                  --force-new-deployment \
                  --region $AWS_REGION
                '''
            }
        }
    }
}
