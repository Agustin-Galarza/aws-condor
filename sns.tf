#
#resource "aws_sns_topic" "reports" {
#  name = "reports"
#}
#
## Create an SNS subscription for SMS notifications
#resource "aws_sns_topic_subscription" "sms_subscription" {
#  topic_arn = aws_sns_topic.reports.arn
#  protocol = "sms"
#  endpoint  = "+5401135237479" # Replace with your phone number
#}
#
## Create an SNS SMS preferences resource to configure the default SMS message type
#resource "aws_sns_sms_preferences" "default_sms_prefs" {
#default_sms_type = "Promotional" # Change to "Promotional" if needed
#}

#module "sns" {
#  source = "cloudposse/sns-topic/aws"
#
#  name      = "Reports"
#  namespace = "condor"
#
#  subscribers = {
#    opsgenie = {
#      protocol               = "sms",
#      endpoint               = "+5491135237479"
#      endpoint_auto_confirms = false,
#      raw_message_delivery   = false
#    }
#  }
#
#  tags = {
#    Name = "Reports"
#  }
#}

module "sns" {
  source   = "terraform-aws-modules/sns/aws"
  version  = "5.3.0"

  name = "Reports"
}


