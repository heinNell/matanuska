apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: maps
  namespace: '250085264089'
  selfLink: /apis/serving.knative.dev/v1/namespaces/250085264089/services/maps
  uid: 0a1a40b3-d44b-4f2a-b241-fb976ae2cbe0
  resourceVersion: AAY7SdwvwxQ
  generation: 20
  creationTimestamp: '2025-07-09T09:46:30.077695Z'
  labels:
    run.googleapis.com/satisfiesPzs: 'true'
    cloud.googleapis.com/location: africa-south1
  annotations:
    serving.knative.dev/creator: www.hjnel@gmail.com
    serving.knative.dev/lastModifier: www.hjnel@gmail.com
    run.googleapis.com/build-enable-automatic-updates: 'false'
    run.googleapis.com/build-function-target: maps
    run.googleapis.com/build-id: 80b4b7b0-51a7-4f68-90cd-3a95bfd5aa89
    run.googleapis.com/build-image-uri: africa-south1-docker.pkg.dev/mat1-9e6b3/cloud-run-source-deploy/maps
    run.googleapis.com/build-name: projects/250085264089/locations/africa-south1/builds/80b4b7b0-51a7-4f68-90cd-3a95bfd5aa89
    run.googleapis.com/build-source-location: gs://run-sources-mat1-9e6b3-africa-south1/services/maps/1752488742.699906-d04300141e8c46748c4ee71dfaecec5f.zip#1752488745524279
    run.googleapis.com/client-name: cloud-console
    run.googleapis.com/operation-id: 2dd383dc-f825-4a13-ad97-da026c20096f
    run.googleapis.com/ingress: all
    run.googleapis.com/ingress-status: all
    run.googleapis.com/invoker-iam-disabled: 'true'
    run.googleapis.com/urls: '["https://maps-250085264089.africa-south1.run.app","https://maps-3ongv2xd5a-bq.a.run.app"]'
spec:
  template:
    metadata:
      labels:
        client.knative.dev/nonce: orwxtlxzzu
        run.googleapis.com/startupProbeType: Default
      annotations:
        autoscaling.knative.dev/maxScale: '100'
        run.googleapis.com/client-name: gcloud
        run.googleapis.com/client-version: 525.0.0
        run.googleapis.com/cloudsql-instances: mat1-9e6b3:us-central1:mat1-9e6b3-instance
        run.googleapis.com/cpu-throttling: 'false'
        run.googleapis.com/startup-cpu-boost: 'true'
    spec:
      containerConcurrency: 80
      timeoutSeconds: 300
      serviceAccountName: firebase-adminsdk-fbsvc@mat1-9e6b3.iam.gserviceaccount.com
      containers:
      - name: maps-1
        image: africa-south1-docker.pkg.dev/mat1-9e6b3/cloud-run-source-deploy/maps@sha256:5c17a017781479f9a428e897b914a637ea1a2e92ece21c8d834600d00bb1bbe6
        ports:
        - name: http1
          containerPort: 8080
        env:
        - name: VITE_FIREBASE_API_KEY
          value: AIzaSyBtq7Z6qqaVmb22d3aNcwNiqkrbGtIhJ7g
        - name: VITE_FIREBASE_AUTH_DOMAIN
          value: mat1-9e6b3.firebaseapp.com
        - name: VITE_FIREBASE_DATABASE_URL
          value: https://mat1-9e6b3-default-rtdb.firebaseio.com
        - name: VITE_FIREBASE_PROJECT_ID
          value: mat1-9e6b3
        - name: VITE_FIREBASE_STORAGE_BUCKET
          value: mat1-9e6b3.firebasestorage.app
        - name: VITE_FIREBASE_MESSAGING_SENDER_ID
          value: '250085264089'
        - name: VITE_FIREBASE_APP_ID
          value: 1:250085264089:web:51c2b209e0265e7d04ccc8
        - name: VITE_FIREBASE_MEASUREMENT_ID
          value: G-YHQHSJN5CQ
        - name: VITE_FIREBASE_DATABASE_ID
        - name: VITE_WIALON_SESSION_TOKEN
          value: c1099bc37c906fd0832d8e783b60ae0dD9D1A721B294486AC08F8AA3ACAC2D2FD45FF053
        - name: VITE_MAPS_SERVICE_URL
          value: https://maps-250085264089.africa-south1.run.app
        - name: VITE_ENV_MODE
          value: production
        - name: mat1-9e6b3-instance
          value: 34.61.112.26
        - name: VITE_MAPS_API_KEY
          value: AIzaSyAgScPnzBI-6vKoL7Cn1_1mkhvCI54chDg
        resources:
          limits:
            cpu: 1000m
            memory: 512Mi
        startupProbe:
          timeoutSeconds: 240
          periodSeconds: 240
          failureThreshold: 1
          tcpSocket:
            port: 8080
  traffic:
  - percent: 100
    latestRevision: true
status:
  observedGeneration: 20
  conditions:
  - type: Ready
    status: 'True'
    lastTransitionTime: '2025-08-01T08:51:13.032980Z'
  - type: BaseImageValidated
    status: 'True'
    severity: Info
  - type: ConfigurationsReady
    status: 'True'
    lastTransitionTime: '2025-07-14T18:58:08.298360Z'
  - type: RoutesReady
    status: 'True'
    lastTransitionTime: '2025-08-01T08:51:13.001898Z'
  latestReadyRevisionName: maps-00018-rjb
  latestCreatedRevisionName: maps-00018-rjb
  traffic:
  - revisionName: maps-00018-rjb
    percent: 100
    latestRevision: true
  url: https://maps-3ongv2xd5a-bq.a.run.app
  address:
    url: https://maps-3ongv2xd5a-bq.a.run.app
