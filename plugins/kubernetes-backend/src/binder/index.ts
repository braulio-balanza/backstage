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

import { isConfigEmpty } from '../api/utils/utils';
import { Router } from 'express';
import { KubeConfig } from '@kubernetes/client-node';
import { bindRoutes as bindPodRoutes } from '../api/Pods/routes';
/* eslint-disable @typescript-eslint/camelcase*/
import { Client1_13, ApiRoot } from 'kubernetes-client';
const KubeRequest = require('kubernetes-client/backends/request');


export const bindRoutes = async (router: Router) => {

    const kc: KubeConfig = new KubeConfig();
    kc.loadFromDefault();
    if (isConfigEmpty(kc)) throw new Error('Kubernetes configuration file was empty!');
    const backend = new KubeRequest({ backend: kc })
    const client: ApiRoot = new Client1_13({ backend })
    bindPodRoutes(router, client);
}
