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
import { KubeConfig, CoreV1Api, V1Pod } from '@kubernetes/client-node'
import { Pod } from './models'
import { getAllNamespacedPods, getNamespacedPods, getNamespacedPod } from './methods'
import { loadFixture } from '../utils/testUtils'

const POD_LIST_FIXTURE = loadFixture('Pods', 'podListResponseFixture.json');
const POD_FIXTURE = loadFixture('Pods', 'podResponseFixture.json');
const kc = new KubeConfig();

beforeAll(() => {
    const dummyCluster = {
        caData: undefined,
        caFile: '/home/dummy/.minikube/ca.crt',
        name: 'minikube',
        server: 'https://192.168.100.100:8443',
        skipTLSVerify: false
    };
    kc.loadFromOptions({ clusters: [dummyCluster], contexts: [], users: [] });
    KubeConfig.prototype.makeApiClient = jest.fn().mockReturnValue(new CoreV1Api);
});
describe('tests pod model', () => {
    describe('pod getting methods', () => {
        beforeAll(() => {
            // Mock listPodForAllNamespaces api call
            CoreV1Api.prototype.listPodForAllNamespaces = jest.fn()
                .mockReturnValue(Promise.resolve(POD_LIST_FIXTURE));
            // Mock listNamespacedPods api call
            CoreV1Api.prototype.listNamespacedPod = jest.fn()
                .mockReturnValueOnce(Promise.resolve(POD_LIST_FIXTURE));
            // Mock readNamespacedPod api call
            CoreV1Api.prototype.readNamespacedPod = jest.fn()
                .mockReturnValue(Promise.resolve(POD_FIXTURE));

        });

        it('gets pods from all namespaces', async () => {

            const podsRaw: V1Pod[] = POD_LIST_FIXTURE.body.items;
            const expectedResult: Pod[] = Pod.buildFromV1PodArray(podsRaw);
            const actualResult: Pod[] = await getAllNamespacedPods(kc);
            expect(actualResult).toEqual(expectedResult);
        })
        it('gets pods for a namespace', async () => {

            const podsRaw: V1Pod[] = POD_LIST_FIXTURE.body.items;
            const expectedResult: Pod[] = Pod.buildFromV1PodArray(podsRaw);
            const actualResult: Pod[] = await getNamespacedPods(kc, { namespace: 'default' });
            expect(actualResult).toEqual(expectedResult);
        });
        it('gets pod from name and namespace', async () => {


            const podRaw: V1Pod = POD_FIXTURE.body;
            const expectedResult: Pod = Pod.buildFromV1PodJSON(podRaw);
            const actualResult: Pod = await getNamespacedPod(kc, { namespace: 'default', name: 'dummy' });
            expect(actualResult).toEqual(expectedResult);
        });

    });

})
