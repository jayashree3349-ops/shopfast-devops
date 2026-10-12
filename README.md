# ShopFast E-Commerce DevOps Project

[![GitHub repository](https://img.shields.io/badge/GitHub-ShopFast--DevOps-181717?logo=github)](https://github.com/jayashree3349-ops/shopfast-devops)

**Repository:** https://github.com/jayashree3349-ops/shopfast-devops

## Problem Statement

Build, containerize, deploy, secure, and verify a small e-commerce application named **ShopFast**. The application consists of a React frontend, a Node.js/Express backend, MongoDB for persistent data, and Redis for caching. The solution must run both as a multi-container Docker Compose application and on a kubeadm Kubernetes cluster hosted on AWS EC2.

The DevOps work must demonstrate optimized container images, service-to-service networking and discovery, health checks, resource limits, Kubernetes Deployments and Services, ConfigMaps and Secrets, persistent MongoDB storage, autoscaling, NetworkPolicies, scheduling preferences, troubleshooting, and Istio canary traffic management for a sample payment service. AWS Security Groups must permit required cluster traffic without unnecessarily exposing internal application or database ports.

### Requirements covered

1. Dockerize the frontend and backend and use a multi-stage frontend build.
2. Publish versioned frontend and backend images to Docker Hub.
3. Run frontend, backend, MongoDB, and Redis using Docker Compose, a bridge network, health checks, persistent named volumes, and CPU/memory limits.
4. Deploy application components to Kubernetes with the appropriate Services.
5. Configure application settings using a ConfigMap and credentials using Kubernetes Secrets mounted as read-only files in the backend.
6. Run MongoDB as a StatefulSet backed by a PersistentVolume and PersistentVolumeClaim, and verify data persistence after pod recreation.
7. Verify Kubernetes DNS and service discovery between workloads.
8. Configure a backend Horizontal Pod Autoscaler targeting 70% CPU utilization, with resource requests and limits.
9. Investigate the Redis container restart using pod state, events, logs, and resource metrics without inventing an unsupported root cause.
10. Configure preferred pod anti-affinity for frontend and backend.
11. Apply Kubernetes NetworkPolicies to restrict backend, MongoDB, and Redis ingress.
12. Install Istio and configure a sample payment service with a 90/10 v1/v2 traffic split.
13. Document the AWS EC2 Security Group rules needed by the two-node cluster.
14. Verify the application path from frontend to backend and from backend to MongoDB and Redis.

**Scope note:** The bonus scenarios involving mixed-content HTTP/HTTPS, deliberate random MongoDB connection loss handling, and additional sidecars were not completed as part of the verified work described here.

## Table of Contents

- [Project Overview](#1-project-overview)
- [Application Architecture](#2-application-architecture)
- [Technologies Used](#3-technologies-used)
- [Prerequisites and Repository Layout](#prerequisites-and-repository-layout)
- [Dockerization and Images](#5-dockerization)
- [Docker Compose](#7-docker-compose)
- [Kubernetes Deployment](#kubernetes-deployment)
- [AWS Security Group Configuration](#aws-security-group-configuration)
- [Troubleshooting and Verification](#troubleshooting-and-verification)
- [Assignment Checklist](#34-assignment-requirement-checklist)
- [Known Limitations](#35-known-limitations)

## 1. Project Overview

ShopFast is an e-commerce application consisting of:

-   **Frontend:** React.js application served through Nginx
-   **Backend:** Node.js + Express REST API
-   **Database:** MongoDB
-   **Cache:** Redis
-   **Service mesh:** Istio
-   **Container orchestration:** Kubernetes
-   **Container runtime:** containerd
-   **CNI:** Calico
-   **Local container orchestration:** Docker Compose

The project demonstrates:

-   Containerization
-   Docker image optimization
-   Docker Compose networking
-   Health checks
-   CPU and memory limits
-   Kubernetes Deployments and Services
-   ConfigMaps and Secrets
-   StatefulSets and persistent storage
-   Kubernetes DNS/service discovery
-   HPA
-   NetworkPolicies
-   Pod affinity/anti-affinity
-   Redis troubleshooting
-   MongoDB persistence
-   Istio canary routing
-   End-to-end application verification

------------------------------------------------------------------------

# 2. Application Architecture

``` text
                         Internet / User
                               |
                               v
                    +----------------------+
                    |  ShopFast Frontend   |
                    | React + Nginx :80    |
                    +----------+-----------+
                               |
                         /api/health
                               |
                               v
                    +----------------------+
                    |   Backend API        |
                    | Node.js + Express    |
                    |        :5000          |
                    +----+------------+----+
                         |            |
                         |            |
                         v            v
                +-------------+  +-------------+
                |  MongoDB    |  |    Redis    |
                |   :27017    |  |    :6379    |
                +-------------+  +-------------+

                    Kubernetes / Istio

                +-------------------------+
                |    Payment Service      |
                |      v1       v2        |
                |       \       /         |
                |        \     /          |
                |      Istio Proxy        |
                |      90% / 10% config   |
                +-------------------------+
```

## Kubernetes architecture

``` text
MASTER
172.31.12.183
  |
  +-- kube-apiserver
  +-- etcd
  +-- scheduler
  +-- controller-manager
  +-- Calico
  +-- CoreDNS
  +-- Metrics Server
  |
  +-------------------------------+
                                  |
                                  | Kubernetes / Calico
                                  |
                                  v
WORKER1
172.31.3.75
  |
  +-- Backend
  +-- Frontend
  +-- MongoDB StatefulSet
  +-- Redis
  +-- Istiod
  +-- Payment v1
  +-- Payment v2
```

------------------------------------------------------------------------

# 3. Technologies Used

  Technology            Purpose
  --------------------- -------------------------------------------
  React.js              Frontend
  Nginx                 Frontend web server and API reverse proxy
  Node.js               Backend runtime
  Express.js            REST API
  MongoDB 7             Database
  Redis 7               Cache
  Docker                Containerization
  Docker Compose V2     Local multi-container deployment
  Kubernetes v1.33.13   Container orchestration
  containerd            Kubernetes container runtime
  Calico                Kubernetes networking/CNI
  Istio 1.31.1          Service mesh and traffic management
  Metrics Server        Kubernetes resource metrics
  HPA                   Backend autoscaling
  AWS EC2               Infrastructure
  Ubuntu                Operating system

------------------------------------------------------------------------

# 4. Project Structure

``` text
shopfast/
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
│
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── package-lock.json
│   └── src/
│       └── App.jsx
│
├── k8s/
│   ├── backend.yaml
│   ├── configmap.yaml
│   ├── frontend.yaml
│   ├── mongodb.yaml
│   ├── networkpolicy.yaml
│   ├── payment.yaml
│   ├── redis.yaml
│   └── istio-1.31.1/
│
└── docker-compose.yml
```

------------------------------------------------------------------------


------------------------------------------------------------------------

# Prerequisites and Repository Layout

## Prerequisites

- AWS EC2 Ubuntu instances for the Kubernetes control plane and worker
- `kubectl` configured to reach the cluster
- Docker Engine and Docker Compose V2 for the Compose deployment
- Node.js/npm only if developing the application outside containers
- `git` and access to the GitHub repository
- Docker Hub access if rebuilding and publishing the images

## Repository layout

```text
shopfast/
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── package-lock.json
│   └── src/
├── k8s/
│   ├── backend.yaml
│   ├── configmap.yaml
│   ├── frontend.yaml
│   ├── mongodb.yaml
│   ├── networkpolicy.yaml
│   ├── payment.yaml
│   └── redis.yaml
├── .env.example
├── .gitignore
└── docker-compose.yml
```

The actual repository contents may evolve. Do not commit `.env`, credentials, private keys, kubeconfig files, cluster certificates, or generated build output. `.env.example` is a placeholder template and must not contain working credentials.

## Clone the repository

```bash
git clone https://github.com/jayashree3349-ops/shopfast-devops.git
cd shopfast-devops
```

## Configure local Compose variables

Create a local `.env` file based on the example. Use a strong, unique password for any real deployment.

```bash
cp .env.example .env
nano .env
```

Set `MONGO_USERNAME` and `MONGO_PASSWORD` in the local `.env` file. Do not commit this file.

# 5. Dockerization

## Backend Dockerfile

The backend uses a Node.js 20 Alpine image.

Important characteristics:

-   Uses `npm ci`
-   Installs production dependencies only
-   Runs as the non-root `node` user
-   Exposes port 5000
-   Uses environment variables for Compose configuration
-   Supports Kubernetes Secret files

Example:

``` dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY server.js .

EXPOSE 5000

USER node

CMD ["node", "server.js"]
```

## Frontend Dockerfile

The frontend uses a multi-stage build.

Stage 1:

-   Installs dependencies
-   Builds the React/Vite application

Stage 2:

-   Uses lightweight Nginx
-   Copies only the generated application
-   Serves the frontend on port 80

``` dockerfile
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

------------------------------------------------------------------------

# 6. Docker Images

The Kubernetes application images were pushed to Docker Hub.

``` text
jayashree0009/shopfast-backend:v1
jayashree0009/shopfast-frontend:v1
```

Local Compose images:

``` text
shopfast/backend:v1
shopfast/frontend:v1
```

------------------------------------------------------------------------

# 7. Docker Compose

The Compose stack contains four services:

``` text
frontend
backend
mongodb
redis
```

All services communicate through:

``` text
shopfast-network
```

which uses the Docker bridge network driver.

## Ports

  Service      Container Port       Host Port
  ---------- ---------------- ---------------
  Frontend                 80            3000
  Backend                5000            5000
  MongoDB               27017   Internal only
  Redis                  6379   Internal only

## Resource limits

### Backend

``` yaml
cpus: 0.5
mem_limit: 512m
```

### Frontend

``` yaml
cpus: 0.5
mem_limit: 256m
```

### MongoDB

``` yaml
cpus: 0.5
mem_limit: 1g
```

### Redis

``` yaml
cpus: 0.25
mem_limit: 256m
```

## Health checks

MongoDB:

``` yaml
test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
```

Redis:

``` yaml
test: ["CMD", "redis-cli", "ping"]
```

Backend waits for MongoDB and Redis to become healthy before startup.

## Persistent Compose volumes

``` text
shopfast_mongodb-data
shopfast_redis-data
```

These named volumes prevent database/cache data from being tied to the
lifecycle of individual containers.

------------------------------------------------------------------------

# 8. Docker Compose Verification

Compose was migrated from legacy Docker Compose V1 to Compose V2.

Final version:

``` text
Docker Compose version v5.5.1
```

The legacy command:

``` text
docker-compose
```

was removed.

The project now uses:

``` bash
docker compose
```

Final Compose status:

``` text
shopfast-backend    Up
shopfast-frontend   Up
shopfast-mongodb    Up (healthy)
shopfast-redis      Up (healthy)
```

## Backend verification

``` bash
curl http://localhost:5000/health
```

Response:

``` json
{
  "status": "healthy",
  "service": "backend"
}
```

## Redis verification

``` text
PONG
```

## Frontend verification

``` bash
curl -I http://localhost:3000
```

Response:

``` text
HTTP/1.1 200 OK
```

## Frontend → Backend verification

``` bash
curl http://localhost:3000/api/health
```

Response:

``` json
{
  "status": "healthy",
  "service": "backend"
}
```

This verifies:

``` text
Browser
  |
  v
Nginx frontend
  |
  v
Backend API
```

------------------------------------------------------------------------

# 9. Kubernetes Cluster

## Cluster nodes

  Node      Role            Kubernetes   Private IP
  --------- --------------- ------------ ---------------
  master    control-plane   v1.33.13     172.31.12.183
  worker1   worker          v1.33.13     172.31.3.75

Both nodes finished in:

``` text
Ready
```

Container runtime:

``` text
containerd
```

------------------------------------------------------------------------

# 10. Kubernetes Application Resources

## Backend

Deployment:

``` text
backend
```

Service:

``` text
backend
```

Service type:

``` text
ClusterIP
```

Port:

``` text
5000
```

HPA:

``` text
backend
```

## Frontend

Deployment:

``` text
frontend
```

Service:

``` text
frontend
```

Service type:

``` text
NodePort
```

NodePort:

``` text
30000
```

## MongoDB

StatefulSet:

``` text
mongodb
```

Pod:

``` text
mongodb-0
```

Service:

``` text
mongodb
```

The MongoDB Service is headless:

``` text
ClusterIP: None
```

## Redis

Deployment:

``` text
redis
```

Service:

``` text
redis
```

Service port:

``` text
6379
```

------------------------------------------------------------------------

# 11. Kubernetes ConfigMap

Configuration is stored in:

``` text
shopfast-config
```

Values include:

``` text
PORT=5000
MONGO_HOST=mongodb
MONGO_PORT=27017
MONGO_DATABASE=shopfast
REDIS_HOST=redis
REDIS_PORT=6379
```

The backend consumes the ConfigMap through:

``` yaml
envFrom:
  - configMapRef:
      name: shopfast-config
```

------------------------------------------------------------------------

# 12. Kubernetes Secrets

MongoDB credentials are stored in a Kubernetes Secret:

``` text
shopfast-secrets
```

The credentials are mounted into the backend as files:

``` text
/etc/shopfast-secrets/mongo-username
/etc/shopfast-secrets/mongo-password
```

The Secret is mounted read-only.

This avoids putting MongoDB credentials directly into Kubernetes
environment variables.

Example:

``` yaml
volumes:
  - name: shopfast-secrets
    secret:
      secretName: shopfast-secrets
```

------------------------------------------------------------------------

# 13. MongoDB StatefulSet and Persistence

MongoDB is deployed as a StatefulSet because the database requires
stable identity and persistent storage.

Resources:

``` text
StatefulSet: mongodb
Pod: mongodb-0
PV: mongodb-pv
PVC: mongodb-pvc
```

Storage:

``` text
5Gi
```

Access mode:

``` text
ReadWriteOnce
```

Reclaim policy:

``` text
Retain
```

Storage class:

``` text
manual
```

PV host path:

``` text
/data/mongodb
```

## MongoDB health checks

Readiness and liveness checks use:

``` bash
mongosh --eval "db.adminCommand('ping')"
```

Probe timeouts were increased to prevent MongoDB from being incorrectly
killed during slow probe execution.

## Persistence verification

A document was inserted:

``` text
test: shopfast-persistence
```

with ObjectId:

``` text
6abdd0e4b6466d04510d09fb
```

The MongoDB pod was deleted and recreated.

After recreation, the document was still present:

``` text
{
  test: 'shopfast-persistence'
}
```

This confirms persistence across MongoDB pod recreation.

### Storage limitation

The Kubernetes MongoDB storage uses a `hostPath`.

Therefore:

-   Persistence across pod recreation on the same node was verified.
-   The data is node-local.
-   This is not equivalent to production-grade network-attached storage.
-   If the pod moves to another node, the hostPath data will not
    automatically follow it.

For production, an EBS-backed StorageClass or another dynamic persistent
storage solution should be used.

------------------------------------------------------------------------

# 14. Redis

Redis is deployed as a Kubernetes Deployment.

Service:

``` text
redis
```

Port:

``` text
6379
```

Resources:

``` yaml
requests:
  cpu: 100m
  memory: 128Mi

limits:
  cpu: 250m
  memory: 256Mi
```

Health checks use:

``` bash
redis-cli ping
```

Expected result:

``` text
PONG
```

------------------------------------------------------------------------

# 15. Kubernetes DNS and Service Discovery

Kubernetes DNS was tested using:

``` text
kubernetes.default.svc.cluster.local
```

CoreDNS successfully resolved the Kubernetes Service.

Redis was tested using:

``` text
redis.default.svc.cluster.local
```

and returned:

``` text
PONG
```

MongoDB was tested using its Kubernetes Service name.

The backend successfully connected to:

``` text
mongodb:27017
redis:6379
```

This confirms Kubernetes service discovery was functioning correctly.

------------------------------------------------------------------------

# 16. Calico Networking

Calico was used as the Kubernetes CNI.

The cluster uses Calico IP-in-IP networking.

Cross-node pod communication was verified.

Example:

``` text
Worker1 pod → Master pod
Master pod → Worker1 pod
```

Calico BGP peering reached:

``` text
Established
```

Example route:

``` text
192.168.235.128/26 via 172.31.3.75 dev tunl0
```

AWS security group rules were required for:

``` text
TCP 179
```

for Calico BGP communication.

------------------------------------------------------------------------

# 17. Kubernetes NetworkPolicies

Three NetworkPolicies were implemented.

## Backend policy

Backend accepts TCP 5000 traffic from:

-   Frontend pods
-   VPC CIDR `172.31.0.0/16`

## MongoDB policy

MongoDB accepts TCP 27017 only from backend pods.

## Redis policy

Redis accepts TCP 6379 only from backend pods.

Resources:

``` text
backend-ingress
mongodb-ingress
redis-ingress
```

A temporary unauthorized test pod was unable to access the backend,
demonstrating that the policies were actively enforced.

------------------------------------------------------------------------

# 18. Kubernetes Affinity / Anti-Affinity

Preferred pod anti-affinity was configured for:

``` text
backend
frontend
```

The topology key is:

``` text
kubernetes.io/hostname
```

This configuration attempts to prevent replicas of the same application
from being scheduled on the same node.

The cluster currently has one worker node, so actual separation is not
possible with the current infrastructure.

The rule is nevertheless configured so it can take effect when
additional worker nodes are added.

------------------------------------------------------------------------

# 19. Backend HPA

A Horizontal Pod Autoscaler was configured for the backend.

Configuration:

``` text
Minimum replicas: 1
Maximum replicas: 5
CPU target: 70%
```

Current example:

``` text
CPU: 2% / 70%
Replicas: 1
```

Metrics Server was installed and verified using:

``` bash
kubectl top nodes
kubectl top pods
```

The backend has resource requests and limits so CPU utilization can be
calculated correctly.

------------------------------------------------------------------------

# 20. Istio Service Mesh

Istio version:

``` text
1.31.1
```

Istiod is deployed in:

``` text
istio-system
```

The payment namespace uses automatic sidecar injection.

Namespace:

``` text
payment
```

Label:

``` text
istio-injection=enabled
```

Both payment workloads run with two containers:

``` text
application container
istio-proxy sidecar
```

------------------------------------------------------------------------

# 21. Payment Service Canary

Two versions were deployed:

``` text
payment-v1
payment-v2
```

Both expose port:

``` text
8080
```

The Kubernetes Service is:

``` text
payment-service
```

Istio DestinationRule defines subsets:

``` text
v1
v2
```

The VirtualService is configured as:

``` text
payment-v1: 90%
payment-v2: 10%
```

Configuration verification returned:

``` text
v1 v2
90 10
```

Both workloads were connected to Istiod:

``` text
payment-v1 → Istiod
payment-v2 → Istiod
```

with CDS, LDS, EDS and RDS subscriptions.

## Important canary testing note

Short 100-request tests produced variable observed distributions,
including results such as:

``` text
42 v1
40 v2
```

and:

``` text
44 v1
53 v2
```

These samples did **not** consistently demonstrate an observed 90/10
distribution.

Therefore the project does **not** claim that these short samples
statistically proved 90/10 traffic distribution.

What was verified is:

1.  The VirtualService is configured for 90/10.
2.  DestinationRule subsets are correctly configured.
3.  Both payment versions are healthy.
4.  Both workloads have Istio sidecars.
5.  Both proxies are connected to Istiod.
6.  Envoy routing configuration contains the payment service route.

For a production validation, a much larger request sample and controlled
traffic-generation methodology should be used.

------------------------------------------------------------------------

# 22. Redis Crash Troubleshooting

Redis had one historical restart.

The previous container showed:

``` text
Received SIGTERM scheduling shutdown
```

and:

``` text
Exit Code: 255
Reason: Unknown
```

Kubernetes events did not identify a definitive cause.

Resource usage was well below configured limits.

Current Redis status:

``` text
Running
```

Health:

``` text
PONG
```

Backend → Redis:

``` text
PONG
```

### Root cause conclusion

The evidence did not support:

-   Redis memory exhaustion
-   CPU exhaustion
-   failed Kubernetes health probes
-   an application-level Redis crash

The available evidence only confirms that the previous container
received SIGTERM and terminated with exit code 255.

The exact initiator of that termination could not be established from
the available Kubernetes events.

No unsupported root cause was assumed.

------------------------------------------------------------------------

# 23. MongoDB Troubleshooting

MongoDB initially entered a restart loop because the health probe used
an overly aggressive timeout.

The probe was effectively timing out before MongoDB could respond:

``` text
command timed out after 1s
```

Kubelet subsequently killed the MongoDB container because the liveness
probe failed.

The probes were changed to:

``` yaml
timeoutSeconds: 5
```

with longer startup delays and failure thresholds.

After recreating the MongoDB pod:

``` text
mongodb-0   1/1 Running
```

MongoDB responded:

``` json
{
  "ok": 1
}
```

Persistence was then verified after pod recreation.

------------------------------------------------------------------------

# 24. Docker Compose Troubleshooting

The original system used:

``` text
docker-compose 1.29.2
```

Docker Engine was much newer.

Running the old Compose implementation resulted in:

``` text
KeyError: 'ContainerConfig'
```

This occurred while recreating MongoDB, Redis and backend containers.

The solution was to install Docker Compose V2 from the Docker
repository.

Final version:

``` text
Docker Compose v5.5.1
```

The legacy package was removed:

``` bash
sudo apt remove -y docker-compose python3-compose
```

The project now uses:

``` bash
docker compose
```

After migration, the complete Compose stack started successfully.

------------------------------------------------------------------------


------------------------------------------------------------------------

# AWS Security Group Configuration

This section documents the EC2 Security Group rules for the current two-node lab cluster. These are the private IP addresses recorded during this project; update `/32` rules if the EC2 private addresses change.

| Node | Role | Private IP |
|---|---|---|
| `master` | Kubernetes control plane | `172.31.12.183` |
| `worker1` | Worker and application workloads | `172.31.3.75` |

Security Groups are stateful. Responses to permitted connections are allowed automatically. Keep SSH and user-facing access limited to trusted source IPs.

## MASTER Security Group — inbound

| Type | Protocol | Port / protocol number | Source | Purpose |
|---|---|---:|---|---|
| SSH | TCP | `22` | `YOUR_PUBLIC_IP/32` | Administrative SSH access |
| Kubernetes API | TCP | `6443` | `172.31.3.75/32` | Worker-to-control-plane API access |
| Kubelet API | TCP | `10250` | `172.31.3.75/32` | Kubelet/metrics communication required by this lab setup |
| Calico BGP | TCP | `179` | `172.31.3.75/32` | Calico BGP peering |
| Calico IP-in-IP | IP protocol `4` | Protocol `4` | `172.31.3.75/32` | IPIP-encapsulated pod traffic |

## WORKER1 Security Group — inbound

| Type | Protocol | Port / protocol number | Source | Purpose |
|---|---|---:|---|---|
| SSH | TCP | `22` | `YOUR_PUBLIC_IP/32` | Administrative SSH access |
| Kubelet API | TCP | `10250` | `172.31.12.183/32` | Control-plane/kubelet communication required by this lab setup |
| Calico BGP | TCP | `179` | `172.31.12.183/32` | Calico BGP peering |
| Calico IP-in-IP | IP protocol `4` | Protocol `4` | `172.31.12.183/32` | IPIP-encapsulated pod traffic |
| Frontend NodePort | TCP | `30000` | `YOUR_CLIENT_PUBLIC_IP/32` or trusted client CIDR | External access to the frontend on the worker |

## Outbound rules

The lab used the default outbound rule on both nodes:

| Rule | Protocol | Destination | Purpose |
|---|---|---|---|
| All traffic | All | `0.0.0.0/0` | Package/image downloads and outbound cluster communication |

If your environment requires restricted egress, replace this broad rule only after identifying and testing every required destination.

## Important: IP-in-IP is not TCP port 4

In the AWS Console, add Calico encapsulation as **Custom protocol / IP protocol 4**. Do not configure it as TCP port `4` or UDP port `4`.

## Add or review the rules in AWS Console

1. Open **EC2 → Instances**.
2. Select `master`, open its **Security** tab, and click its Security Group.
3. Choose **Edit inbound rules** and add/review the MASTER entries above.
4. Repeat for `worker1` using the WORKER1 table.
5. Replace `YOUR_PUBLIC_IP/32` with the administrator's actual public IP and `YOUR_CLIENT_PUBLIC_IP/32` with the intended client IP. These are placeholders, not literal values to enter.
6. Save and confirm the correct Security Group is attached to each instance.

If both nodes use the same Security Group, security-group self-referencing rules can be used for node-to-node access. When using private-IP `/32` sources, update the rules whenever private IPs change.

## Ports that should not be exposed publicly

Do not create public inbound rules for these ports simply because the services use them:

| Service | Port | Intended access |
|---|---:|---|
| Backend | `5000` | Frontend and authorized in-cluster workloads |
| MongoDB | `27017` | Backend workload, restricted by NetworkPolicy |
| Redis | `6379` | Backend workload, restricted by NetworkPolicy |
| Kubernetes DNS | `53/TCP` and `53/UDP` | Cluster workloads through CoreDNS |

The backend is exposed as a Kubernetes `ClusterIP`; MongoDB uses a headless Service; Redis uses `ClusterIP`. The frontend is exposed as NodePort `30000`. AWS Security Groups and Kubernetes NetworkPolicies are separate layers.

## Security Group verification

On MASTER:

```bash
kubectl get nodes -o wide
kubectl get pods -A
kubectl get services
kubectl get networkpolicy
```

From WORKER1, verify API-server TCP reachability:

```bash
nc -vz 172.31.12.183 6443
```

Test BGP TCP reachability in each direction:

```bash
# Run on WORKER1
nc -vz 172.31.12.183 179

# Run on MASTER
nc -vz 172.31.3.75 179
```

TCP reachability does not by itself prove BGP has established. Also inspect Calico/BIRD peer status. For the frontend, browse to `http://WORKER1_PUBLIC_IP:30000` from a permitted client network, replacing the placeholder with the actual public IP. If the worker has no public IP, use an approved VPN, bastion, or private access path.

## Security Group troubleshooting

- **Worker cannot join:** check MASTER inbound TCP `6443` from `172.31.3.75/32`, API-server health, and routing.
- **Calico BGP is not established:** check TCP `179` in both directions and Calico pod/peer health.
- **Cross-node pod networking fails:** confirm IP protocol `4` is permitted between nodes because this cluster uses IPIP encapsulation.
- **Metrics Server cannot scrape kubelets:** check TCP `10250` reachability and Metrics Server/kubelet configuration.
- **Frontend NodePort fails:** check Service port `30000`, frontend pod readiness, client source CIDR, and worker reachability.
- **A ClusterIP service is not reachable from the internet:** this is expected; use the intended in-cluster path rather than exposing database/cache/backend ports.

## Security recommendations

- Never use `0.0.0.0/0` for SSH when a narrow administrator CIDR is possible.
- Restrict NodePort `30000` to intended client addresses.
- Keep API server, kubelet, and Calico traffic limited to cluster nodes or a trusted management network.
- Never expose MongoDB, Redis, or backend ports publicly.
- Do not store passwords, tokens, private keys, or kubeconfig credentials in this README or Git.
- These rules are for this lab topology, not a universal production policy. Review least-privilege requirements for production.

# 25. AWS Security Group Troubleshooting

Several Kubernetes networking issues required AWS Security Group
configuration.

## Kubernetes API Server

Worker1 needed access to the master API server:

``` text
TCP 6443
```

Source:

``` text
172.31.3.75/32
```

## Calico BGP

Calico required:

``` text
TCP 179
```

between:

``` text
Master: 172.31.12.183
Worker1: 172.31.3.75
```

## Kubelet metrics

Metrics Server required access to kubelet:

``` text
TCP 10250
```

The necessary AWS security group rule was added.

Metrics then became available through:

``` bash
kubectl top nodes
```

------------------------------------------------------------------------

# 26. Backend Application

The backend provides:

## Health endpoint

``` http
GET /health
```

Response:

``` json
{
  "status": "healthy",
  "service": "backend"
}
```

## Root endpoint

``` http
GET /
```

Response:

``` json
{
  "message": "ShopFast Backend API"
}
```

The backend connects to:

``` text
MongoDB
Redis
```

and only starts listening on port 5000 after successful service
connections.

------------------------------------------------------------------------

# 27. Frontend Application

The frontend is a React/Vite application.

It calls:

``` text
/api/health
```

Nginx proxies this request to:

``` text
http://backend:5000/
```

This allows the frontend to communicate with the backend using the
Kubernetes/Docker service name instead of a hard-coded IP.

------------------------------------------------------------------------

# 28. End-to-End Verification

The following application flow was successfully tested:

``` text
Frontend
   |
   | /api/health
   v
Nginx
   |
   v
Backend
   |
   +------> MongoDB
   |
   +------> Redis
```

Compose verification:

``` text
Frontend HTTP 200
Backend HTTP 200
MongoDB healthy
Redis healthy
Backend → MongoDB connected
Backend → Redis connected
```

Kubernetes verification:

``` text
Nodes Ready
Pods Running
Services available
CoreDNS working
MongoDB persistent
Redis reachable
Backend HPA active
NetworkPolicies active
Istio proxies connected
Payment v1/v2 healthy
```

------------------------------------------------------------------------

# 29. Useful Commands

## Kubernetes

Check nodes:

``` bash
kubectl get nodes -o wide
```

Check all pods:

``` bash
kubectl get pods -A -o wide
```

Check services:

``` bash
kubectl get svc
```

Check deployments:

``` bash
kubectl get deploy
```

Check StatefulSets:

``` bash
kubectl get statefulset
```

Check HPA:

``` bash
kubectl get hpa
```

Check metrics:

``` bash
kubectl top nodes
kubectl top pods
```

Check storage:

``` bash
kubectl get pv,pvc
```

Check NetworkPolicies:

``` bash
kubectl get networkpolicy
```

Check Istio:

``` bash
istioctl proxy-status
```

------------------------------------------------------------------------

# 30. Docker Compose Commands

Start:

``` bash
docker compose up -d --build
```

Check:

``` bash
docker compose ps
```

Logs:

``` bash
docker compose logs --tail=30 backend
```

Stop:

``` bash
docker compose down
```

Important:

``` bash
docker compose down -v
```

should **not** be used when database data must be preserved because it
removes named volumes.

------------------------------------------------------------------------

# 31. Resource Optimization

The project includes resource requests and limits.

Example backend:

``` yaml
resources:
  requests:
    cpu: "100m"
    memory: "128Mi"
  limits:
    cpu: "500m"
    memory: "512Mi"
```

Frontend:

``` yaml
resources:
  requests:
    cpu: "100m"
    memory: "128Mi"
  limits:
    cpu: "500m"
    memory: "256Mi"
```

Redis:

``` yaml
requests:
  cpu: "100m"
  memory: "128Mi"

limits:
  cpu: "250m"
  memory: "256Mi"
```

MongoDB:

``` yaml
requests:
  cpu: "250m"
  memory: "256Mi"

limits:
  cpu: "500m"
  memory: "1Gi"
```

These limits prevent uncontrolled resource consumption and allow
Kubernetes HPA metrics to operate.

------------------------------------------------------------------------

# 32. Security Improvements

Implemented:

-   Kubernetes Secret for MongoDB credentials
-   Secret mounted as files
-   Read-only Secret volume
-   NetworkPolicies
-   Restricted database ingress
-   Restricted Redis ingress
-   Backend resource limits
-   Frontend resource limits
-   Non-root backend container user
-   Internal ClusterIP services for backend/database/cache
-   MongoDB and Redis not exposed through Kubernetes NodePort
-   Docker Compose internal network

------------------------------------------------------------------------

# 33. Current Kubernetes Status

Expected application workloads:

``` text
backend       1/1 Running
frontend      1/1 Running
mongodb-0     1/1 Running
redis         1/1 Running
```

Payment:

``` text
payment-v1    2/2 Running
payment-v2    2/2 Running
```

Istiod:

``` text
istiod        1/1 Running
```

Core Kubernetes system components were also healthy.

------------------------------------------------------------------------

# 34. Assignment Requirement Checklist

  Requirement                          Status
  ------------------------------------ ----------
  Dockerize frontend                   Complete
  Dockerize backend                    Complete
  Dockerize application dependencies   Complete
  Multi-stage frontend image           Complete
  Push application images              Complete
  Docker Compose bridge network        Complete
  Docker Compose health checks         Complete
  Docker Compose CPU limits            Complete
  Docker Compose memory limits         Complete
  Kubernetes Deployments               Complete
  Backend ClusterIP                    Complete
  Frontend NodePort                    Complete
  ConfigMap                            Complete
  Kubernetes Secret                    Complete
  Secret mounted as volume             Complete
  MongoDB StatefulSet                  Complete
  MongoDB PV/PVC                       Complete
  MongoDB readiness probe              Complete
  MongoDB liveness probe               Complete
  Kubernetes DNS/service discovery     Complete
  Backend HPA                          Complete
  Redis troubleshooting                Complete
  Affinity/anti-affinity               Complete
  NetworkPolicies                      Complete
  Istio installation                   Complete
  Payment v1/v2                        Complete
  Istio 90/10 configuration            Complete
  MongoDB persistence verification     Complete
  End-to-end testing                   Complete

------------------------------------------------------------------------

# 35. Known Limitations

## Bonus scenarios not implemented

The core project work documented above was completed and verified. The optional bonus scenarios below were not completed and should not be represented as implemented:

- Mixed-content HTTP/HTTPS remediation.
- Deliberate/random MongoDB connection-loss testing and application reconnection/recovery handling.
- Additional sidecar containers beyond the Istio-injected proxies used by the payment workloads.


## MongoDB hostPath

The Kubernetes MongoDB storage is node-local:

``` text
hostPath: /data/mongodb
```

It protects data from pod recreation on the same node, but it is not
suitable as a highly available production storage architecture.

## Single worker node

Only one worker node is currently available.

Therefore pod anti-affinity cannot physically spread replicas across
different workers.

## Canary observation

The Istio VirtualService is configured:

``` text
90% v1
10% v2
```

but short 100-request tests produced variable distributions and did not
consistently match 90/10.

The configuration was verified directly rather than claiming an
inaccurate observed percentage.

## No Ingress

The frontend currently uses:

``` text
NodePort 30000
```

rather than an external Ingress controller.

------------------------------------------------------------------------

# 36. Possible Production Improvements

Future improvements could include:

-   Multiple Kubernetes worker nodes
-   AWS EBS CSI-backed persistent storage
-   MongoDB replica set
-   Managed MongoDB
-   Managed Redis
-   Kubernetes Ingress
-   TLS/HTTPS
-   cert-manager
-   External Secrets
-   NetworkPolicy egress restrictions
-   PodDisruptionBudgets
-   More comprehensive observability
-   Prometheus and Grafana
-   Centralized logging
-   Image vulnerability scanning
-   CI/CD pipeline
-   Blue/green deployment
-   Automated canary analysis
-   Larger controlled Istio load tests

------------------------------------------------------------------------

# 37. Conclusion

The ShopFast project demonstrates a complete DevOps workflow from
containerization to Kubernetes deployment and service-mesh traffic
management.

The final implementation includes:

``` text
Docker
   ↓
Docker Compose
   ↓
Kubernetes
   ↓
Calico Networking
   ↓
ConfigMaps + Secrets
   ↓
Persistent MongoDB
   ↓
Redis
   ↓
HPA
   ↓
NetworkPolicies
   ↓
Istio
   ↓
Canary-ready Payment Service
```

The application was tested at both Docker Compose and Kubernetes levels,
including service discovery, database connectivity, Redis connectivity,
persistent storage, autoscaling metrics, network isolation, and Istio
configuration.
