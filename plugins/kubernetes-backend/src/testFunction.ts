/*
 * Copyright 2020 Spotify AB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* eslint-disable */
// import { KubeConfig, /* CoreV1Api */ } from '@kubernetes/client-node';
import * as GoDaddyKubernetes from 'kubernetes-client'
// const { KubeConfig } = require('kubernetes-client')
// const Request = require('kubernetes-client/backends/request')
// import { getAllNamespacedPods } from './api/Pods/methods'
// import { Pod } from './api/Pods/models';
// import { getAllNamespacedPods } from './api/Pods/methods'
// import { Pod } from './api/Pods/models'
// import { getClusters } from './api/Clusters/methods'
// import { Cluster } from 'api/Clusters/models';
// k8sApi.listNamespacedPod('default').then((res) => {
//     console.log(res.body.items);
// });

const { KubeConfig } = require('kubernetes-client')
const KubeRequest = require('kubernetes-client/backends/request')
export const testFunction = async () => {
    console.log('This is being executed');
    const Client = GoDaddyKubernetes.Client1_13;
    // const config = GoDaddyKubernetes.config;
    // config.fromKubeconfig();
    // const config = new KubeConfig();
    // config.loadFromDefault();
    const config = new KubeConfig()
    config.loadFromDefault()
    const backend = new KubeRequest({ kubeconfig: config })
    // const backend = new Request({ config });
    // const goDaddyConfig: GoDaddyKubernetes.ClientConfiguration = GoDaddyKubernetes.config.fromKubeconfig(config, 'minikube');
    // const client = new Client({ version: '1.13', config: goDaddyConfig });
    // const backend = new Request({ config });
    // const client = new Client({ version: '1.13' });
    const client = new Client({ backend });
    // const kc = new KubeConfig();
    // kc.loadFromDefault();
    // kc.setCurrentContext('standard-cluster-1');
    // kc.setCurrentContext('minikube');
    // const clusterRes: ClusterResponse = kc.getClusters()[0];
    // const testCluster: Cluster = { name: clusterRes.name, server: clusterRes.server };
    // const k8sApi = kc.makeApiClient(CoreV1Api);
    // try {
    // const testValue = await k8sApi.listNamespacedPod('default', undefined, undefined, undefined, undefined, 'app=nginx-test');
    // const testValue = await getAllNamespacedPods(kc, { labels: { "app": "nginx-test-2" } });
    // const testValue = await k8sApi.listNode();
    // const testValue: Pod[] = await getAllNamespacedPods(kc);
    // const testValue = await k8sApi.readNamespacedPod("event-exporter-v0.2.5-599d65f456-nxn6k", "kube-system");
    const response = await client.api.v1.pods.get();
    return response
};
    // } catch (e) {
    // return { response: e.message }
    // }
    // const testValue = getClusters(kc);
    // console.log(testValue.body.items[0]);