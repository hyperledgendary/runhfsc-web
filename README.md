# runhfsc-web

An example of packaging an Hyperledger Fabric client application, and running it on K8S.  For example running it against the [Full Stack Asset Transfer Workshop](https://github.com/hyperledgendary/full-stack-asset-transfer-guide)

![](runhfsc-web.png)

## Dev Notes

- Express Application, to provide simple server to render a webpage
  - Note the 'genesis' of this repo was similar but had need to render different pages, depending on use. Search ampretia/code-hats
- Using the `xterm.js` library to provide an in browser console
- Using `node-ty` to link, via websockets, the `xterm.js` console to a running instance of `runhfsc`

- The express server portion is in `src` and the code for in browser is in `clientsrc` Note that these have different typescript configurations
- `Rollup.js` is used to produce the browser code bundle (hence a different ts configuration is needed)

- A version of `runfsc` is copied into the dockerfile and installed.
  - Clone `runhfsc` and `npm run build && npm pack`
- A `k8s/application_deployment.yaml` is present to run this in k8s alongside the `test-network-k8s`

## Rough Guide to usage

 - Get the [full-stack-application-guide](https://github.com/hyperledgendary/full-stack-asset-transfer-guide)
```
git clone https://github.com/hyperledgendary/full-stack-asset-transfer-guide.git workshop
cd workshop
export WORKSHOP_PATH=$(pwd)

# get the Fabric Binaries
curl -sSL https://raw.githubusercontent.com/hyperledger/fabric/main/scripts/install-fabric.sh | bash -s -- binary

export PATH=${WORKSHOP_PATH}/bin:$PATH
export FABRIC_CFG_PATH=${WORKSHOP_PATH}/config
export WORKSHOP_INGRESS_DOMAIN=localho.st
export WORKSHOP_NAMESPACE=test-network

# Start the local k8s cluster
just kind

# Create the Ansible configuration
just ansible-review-config
just ansible-ingress

# Start the operator and Fabric Operations Console

just ansible-operator
just ansible-console

# Construct a network and channel with ansible playbooks
just ansible-network

just ansible-build-chaincode
just ansible-deploy-chaincode
just ansible-ready-application

# git clone runhfsc and runhfsc-web locally
git clone https://github.com/hyperledgendary/runhfsc 
git cloen https://github.com/hyperledgendary/runhfsc-web

cd ${WORKSHOP_PATH}/runhfsc
npm install
npm run build && npm pack
cp hyperledgendary-runhfsc-0.0.5.tgz cd ${WORKSHOP_PATH}/runhfsc-web

cd cd ${WORKSHOP_PATH}/runhfsc/runhfsc-web
docker build -t runhfsc-web:0.0.5 .

# create copy of the id-endpoint-config.yaml to match the connection information
# See below for more details on this step
kubectl -n test-network apply -f k8s/id-endpoint-config.yaml
kubectl -n test-network apply -f k8s/application-deployment.yaml
```


Navigate to `runhfsc-web.localho.st`

Commands to run - note that the default profile here is the only one and matches the Fabric network configuration created above.

```
connect
metadata

submit CreateAsset '[{"ID":"007","Colour":"RedWhiteBlue","Size":"1","Owner":"HMG","AppraisedValue":"200"}]'
evaluate @json ReadAsset '["007"]'

submit CreateAsset '[{"ID":"006","Colour":"Yellow","Size":"1","Owner":"HMG","AppraisedValue":"200"}]'
evaluate @json getAllAssets
```

## K8S ConfigMap configuration
There are two config maps, [id-endpoint-config](./k8s/id-endpoint-config.yaml.example) and [application_deployment](./k8s/application-deployment.yaml).

The contents of `application-deployment.yaml` describe the docker image to use, ingress and service to expose the http ports. The configuration of _runhfsc_ itself are also here. This doesn't need to have any updates specific for the k8s and fabric instance you've running

`id-endpoint-config` needs to be configured as this contains the Certificates and Private Keys needed. The example file is below.
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-org1peer-endpoint
data: 
  profile.json : | 
    {
        "peers": {
          "Org1 Peer": {
            "url": "grpcs://test-network-org1peer-peer.localho.st:443",
            "tlsCACerts": {
              "pem": "-----BEGIN CERTIFICATE-----\nMIICCzC....UeHuW+SWfA1gY=\n-----END CERTIFICATE-----\n"
            }
          }
        }
    }
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-fabric-ids-v2-map
data: 
  asset-transfer_appid.json : | 
    {
        "name": "asset-transfer.admin",
        "cert": "LS0tLS1CRUdLS0tCg==",
        "ca": "LS0tLS1CRUdJT....LS0K",
        "hsm": false,
        "private_key": "LS0tLS.....S0tCg=="
    } 

```
The `app-org1peer-endpoint` gives the URL of the gatewway endpoint. In the example it's mapped to `localho.st`.  Copy into this the TLS certificate for the Orgs TLS Root CA. 

`app-fabric-ids-v2-map` refers to the identity to use here; copy this information from the `asset-transfer_appid.json` file created ansible.