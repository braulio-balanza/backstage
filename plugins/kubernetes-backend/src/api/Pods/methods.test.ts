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
import { getAllNamespacedPods, getNamespacedPods, getNamespacedPodFromName } from './methods'
import fse from 'fs-extra';
import path from 'path';

const loadFixture = (fixture: string) => {
    return JSON.parse(
        fse.readFileSync(
            path.join(__dirname, '__fixtures__', fixture)
        ).toString('utf-8')
    );
}

const POD_LIST_FIXTURE = loadFixture('podListFixture.json');
const POD_FIXTURE = loadFixture('podFixture.json');
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
describe('pod getting methods', () => {
    // Mock listPodForAllNamespaces api call
    CoreV1Api.prototype.listPodForAllNamespaces = jest.fn()
        .mockReturnValue(Promise.resolve(POD_LIST_FIXTURE));
    it('gets pods from all namespaces', async () => {
        const podsRaw: V1Pod[] = POD_LIST_FIXTURE.body.items;
        const expectedResult: Pod[] = podsRaw.map((pod: V1Pod) => Pod.buildFromV1Pod(pod));
        const actualResult: Pod[] = await getAllNamespacedPods(kc);
        expect(actualResult).toEqual(expectedResult);
    })
    it('gets pods for a namespace', async () => {
        // Mock lisNamespacedPod api call
        CoreV1Api.prototype.listNamespacedPod = jest.fn()
            .mockReturnValue(Promise.resolve(POD_LIST_FIXTURE));

        const podsRaw: V1Pod[] = POD_LIST_FIXTURE.body.items;
        const expectedResult: Pod[] = Pod.buildArrayFromV1PodArray(podsRaw);
        const actualResult: Pod[] = await getNamespacedPods(kc, { namespace: 'default' });
        expect(actualResult).toEqual(expectedResult);
    });
    it('gets pod from name and namespace', async () => {
        // Mock lisNamespacedPod api call
        CoreV1Api.prototype.readNamespacedPod = jest.fn()
            .mockReturnValue(Promise.resolve(POD_FIXTURE));

        const podRaw: V1Pod = POD_FIXTURE.body;
        const expectedResult: Pod = Pod.buildFromV1Pod(podRaw);
        const actualResult: Pod = await getNamespacedPodFromName(kc, { namespace: 'default', name: 'dummy' });
        expect(actualResult).toEqual(expectedResult);
    });
    it('returns error on empty kubeconfig file', async () => {
        const emptyKubeConfigFile: KubeConfig = new KubeConfig();
        const kubeConfigOptions = { clusters: [], users: [], contexts: [] }
        const kubeConfigWithNoValues: KubeConfig = new KubeConfig();
        kubeConfigWithNoValues.loadFromOptions(kubeConfigOptions)

        await expect(getAllNamespacedPods(emptyKubeConfigFile)).rejects.toThrowError('Kubernetes configuration file was empty!')
        await expect(getNamespacedPods(emptyKubeConfigFile, { namespace: 'dummy' })).rejects.toThrowError('Kubernetes configuration file was empty!')
        await expect(getNamespacedPodFromName(emptyKubeConfigFile, { namespace: 'dummy', name: 'dummy' })).rejects.toThrowError('Kubernetes configuration file was empty!')
    });
});