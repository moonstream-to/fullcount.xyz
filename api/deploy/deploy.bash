#!/usr/bin/env bash

# Deployment script - intended to run on Fullcount API server

# Colors
C_RESET='\033[0m'
C_RED='\033[1;31m'
C_GREEN='\033[1;32m'
C_YELLOW='\033[1;33m'

# Logs
PREFIX_INFO="${C_GREEN}[INFO]${C_RESET} [$(date +%d-%m\ %T)]"
PREFIX_WARN="${C_YELLOW}[WARN]${C_RESET} [$(date +%d-%m\ %T)]"
PREFIX_CRIT="${C_RED}[CRIT]${C_RESET} [$(date +%d-%m\ %T)]"

# Main
APP_DIR="${APP_DIR:-/home/ubuntu/fullcount}"
AWS_DEFAULT_REGION="${AWS_DEFAULT_REGION:-us-east-1}"
SCRIPT_DIR="$(realpath $(dirname $0))"
SECRETS_DIR="${SECRETS_DIR:-/home/ubuntu/fullcount-secrets}"
PARAMETERS_ENV_PATH="${SECRETS_DIR}/app.env"
MONITORING_SECRETS_DIR="${MONITORING_SECRETS_DIR:-/home/ubuntu/monitoring-secrets}"
MONITORING_ENV_PATH="${MONITORING_SECRETS_DIR}/app.env"
USER_SYSTEMD_DIR="${USER_SYSTEMD_DIR:-/home/ubuntu/.config/systemd/user}"

# API server service file
FULLCOUNT_API_SERVICE_FILE="fullcount-api.service"

FULLCOUNT_MONITORING_SERVICE_FILE="monitoring-fullcount.service"

set -eu

echo
echo
echo -e "${PREFIX_INFO} Source nvm"
. /home/ubuntu/.nvm/nvm.sh

echo
echo
echo -e "${PREFIX_INFO} Installing Node.js dependencies"
EXEC_DIR=$(pwd)
cd "${APP_DIR}/api"
/home/ubuntu/.nvm/versions/node/v19.9.0/bin/npm install
cd "${EXEC_DIR}"

echo
echo
echo -e "${PREFIX_INFO} Build fullcount API server"
EXEC_DIR=$(pwd)
cd "${APP_DIR}/api"
/home/ubuntu/.nvm/versions/node/v19.9.0/bin/npm run build
cd "${EXEC_DIR}"

echo
echo
echo -e "${PREFIX_INFO} Install checkenv"
HOME=/home/ubuntu /usr/local/go/bin/go install github.com/bugout-dev/checkenv@latest

echo
echo
echo -e "${PREFIX_INFO} Retrieving deployment parameters"
if [ ! -d "${SECRETS_DIR}" ]; then
  mkdir "${SECRETS_DIR}"
  echo -e "${PREFIX_WARN} Created new secrets directory"
fi
AWS_DEFAULT_REGION="${AWS_DEFAULT_REGION}" /home/ubuntu/go/bin/checkenv show aws_ssm+fullcount:true > "${PARAMETERS_ENV_PATH}"
chmod 0640 "${PARAMETERS_ENV_PATH}"

echo
echo
echo -e "${PREFIX_INFO} Copy monitoring binary from AWS S3"
aws s3 cp s3://bugout-binaries/prod/monitoring/monitoring "/home/ubuntu/monitoring"
chmod +x "/home/ubuntu/monitoring"

echo
echo
echo -e "${PREFIX_INFO} Copy monitoring configuration"
if [ ! -d "$MONITORING_SECRETS_DIR" ]; then
  echo -e "${PREFIX_WARN} There are no ${MONITORING_SECRETS_DIR}, creating new one.."
  mkdir -p "${MONITORING_SECRETS_DIR}"
fi
cp "${SCRIPT_DIR}/files/config-monitoring-fullcount.json" "${MONITORING_SECRETS_DIR}/config-monitoring-fullcount.json"

echo
echo
echo -e "${PREFIX_INFO} Retrieving monitoring deployment parameters"
AWS_DEFAULT_REGION="${AWS_DEFAULT_REGION}" /home/ubuntu/go/bin/checkenv show aws_ssm+monitoring:true,service:true > "${MONITORING_ENV_PATH}"
chown ubuntu:ubuntu "${MONITORING_ENV_PATH}"
chmod 0640 "${MONITORING_ENV_PATH}"

echo
echo
echo -e "${PREFIX_INFO} Fetch local IP of instance and save to monitoring secrets"
AWS_LOCAL_IPV4=$(ec2metadata --local-ipv4)
echo "AWS_LOCAL_IPV4=$AWS_LOCAL_IPV4" >> "${MONITORING_ENV_PATH}"

echo
echo
echo -e "${PREFIX_INFO} Add AWS default region to monitoring parameters"
echo "AWS_DEFAULT_REGION=${AWS_DEFAULT_REGION}" >> "${MONITORING_ENV_PATH}"

echo
echo
echo -e "${PREFIX_INFO} Prepare user systemd directory"
if [ ! -d "${USER_SYSTEMD_DIR}" ]; then
  mkdir -p "${USER_SYSTEMD_DIR}"
  echo -e "${PREFIX_WARN} Created new user systemd directory"
fi

echo
echo
echo -e "${PREFIX_INFO} Replacing existing Fullcount API service definition with ${FULLCOUNT_API_SERVICE_FILE}"
chmod 644 "${SCRIPT_DIR}/${FULLCOUNT_API_SERVICE_FILE}"
cp "${SCRIPT_DIR}/${FULLCOUNT_API_SERVICE_FILE}" "${USER_SYSTEMD_DIR}/${FULLCOUNT_API_SERVICE_FILE}"
XDG_RUNTIME_DIR="/run/user/1000" systemctl --user daemon-reload
XDG_RUNTIME_DIR="/run/user/1000" systemctl --user restart "${FULLCOUNT_API_SERVICE_FILE}"

echo
echo
echo -e "${PREFIX_INFO} Replacing existing Fullcount monitoring service definition with ${FULLCOUNT_MONITORING_SERVICE_FILE}"
chmod 644 "${SCRIPT_DIR}/${FULLCOUNT_MONITORING_SERVICE_FILE}"
cp "${SCRIPT_DIR}/${FULLCOUNT_MONITORING_SERVICE_FILE}" "${USER_SYSTEMD_DIR}/${FULLCOUNT_MONITORING_SERVICE_FILE}"
XDG_RUNTIME_DIR="/run/user/1000" systemctl --user daemon-reload
XDG_RUNTIME_DIR="/run/user/1000" systemctl --user restart "${FULLCOUNT_MONITORING_SERVICE_FILE}"
