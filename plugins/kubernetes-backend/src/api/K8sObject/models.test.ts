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
import { V1ObjectMeta, V1PodSpec, V1PodStatus, V1Container } from '@kubernetes/client-node'
import { K8sObject } from './models';

describe('test K8sObject', () => {
    describe('K8sObject build methods', () => {
        it('can build from V1Pod like object', () => {
            const podLikeObjecy: { metadata: V1ObjectMeta, spec: V1PodSpec, status: V1PodStatus } =
                { metadata: {}, spec: { containers: new Array<V1Container>() }, status: {} };
            expect(K8sObject.build(podLikeObjecy)).toBeInstanceOf(K8sObject);
        });
    })
});
