terraform {
  backend "s3" {
    bucket  = "media-app-terraform-state"
    key     = "develop/mediapp.tfstate"
    region  = "us-east-1"
    encrypt = true
  }
}

locals {
  prefix = "${var.prefix}-${terraform.workspace}"

  common_tags = {
    Environment = terraform.workspace
    Project     = var.project
    ManagedBy   = "Terraform"
    Owner       = "Mammadali Gasimov"
  }
}
