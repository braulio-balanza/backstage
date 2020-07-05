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
import { loadFixture } from '../utils/testUtils'
import { Pod, PodOverview } from './models'
import { V1Pod, V1Container, V1ObjectMeta, V1ContainerStatus, V1PodStatus } from '@kubernetes/client-node'

import {
    V1ObjectMetaGuard
} from 'api/K8sObject/typeGuards';
const { body: v1Pod }: { body: V1Pod } = loadFixture('Pods', 'podResponseFixture.json');

describe(`tests model's methods work properly`, () => {
    const testPod: Pod = Pod.buildFromV1PodJSON(v1Pod);

    describe(`builds pod`, () => {
        it(" builds pod from V1Pod", () => {
            expect(typeof testPod.name).toEqual("string");
            expect(V1ObjectMetaGuard.is(testPod.metadata)).toBe(true);
            expect(testPod.spec).toBeInstanceOf(Object);
            expect(testPod.status).toBeInstanceOf(Object);
        });
        it("Allows for null vallues", () => {
            const emptyPod: Pod = Pod.build({ name: "foo" });
            expect(emptyPod.name).toMatchInlineSnapshot(`"foo"`);
            expect(emptyPod.metadata).toBeUndefined();
            expect(emptyPod.spec).toBeUndefined();
            expect(emptyPod.status).toBeUndefined();
        })
        it("builds Pod from JSON", () => {
            const testPodFromV1: Pod = Pod.buildFromV1PodJSON(v1Pod);
            expect(testPodFromV1.buildV1PodJSON()).toEqual(v1Pod);
        })
        it(" Builds Pod from V1Pod with no name ", () => {
            const noNameV1Pod = v1Pod;
            if (noNameV1Pod.metadata) noNameV1Pod.metadata.name = undefined;
            expect(Pod.buildFromV1PodJSON(noNameV1Pod).name).toEqual("");
        });
    });
    describe('tests pods methods', () => {
        it('returns list of containers', () => {
            const containersFromPod: V1Container[] | undefined = testPod.getContainers();
            if (containersFromPod)
                expect(containersFromPod[0]).toBe(v1Pod.spec?.containers[0])
            else
                throw new Error('Containers should return');
        })
        it('returns the pods container statuses', () => {
            const containerStatuses: V1ContainerStatus[] | undefined = testPod.getContainersStatuses()
            if (containerStatuses)
                expect(containerStatuses).toEqual(v1Pod.status?.containerStatuses)
            else
                throw new Error('Containers should return');
        });
        it('returns a string with the proportion of ready/total containers', () => {
            const containersReady: String = testPod.getContainersReady();
            expect(containersReady).toEqual('1/1');
        })
        it('returns the total number of container restarts', () => {
            const containerRestarts: number = testPod.getContainersRestarts();
            expect(containerRestarts).toEqual(14);
        })

        it('returns a pod IP', () => {
            const podIP: string = testPod.getPodIp();
            expect(podIP).toMatchInlineSnapshot(`"172.17.0.3"`)
        });
        it('returns the node name', () => {
            const nodeName: string = testPod.getNodeName();
            expect(nodeName).toMatchInlineSnapshot(`"minikube"`)
        });
        describe('tests the metadata type guard', () => {
            it('returns the metadata as a V1ObjectMeta', () => {
                const meta: unknown = testPod.getMetadata();
                expect(meta).toBeInstanceOf(V1ObjectMeta)
            })

        });


        it('returns a pod overview', () => {
            const toCompare: PodOverview = {
                name: 'hello-node-57c6f5dbf6-v2txn',
                containersReady: '1/1',
                restarts: 14,
                age: 0,
                ip: '172.17.0.3',
                node: 'minikube',
                created: new Date('2020-04-28T22:32:45Z'),
            };
            const podOverview: PodOverview = testPod.getPodOverview();
            // copy age property to avoid flaky test 
            toCompare.age = podOverview.age;
            expect(podOverview).toMatchObject(toCompare);
        });
        it('decodes pod status with proper type', () => {
            expect(testPod.status).toBeInstanceOf(V1PodStatus);
        })
    })
    // Will want to move this to k8sObject in the future
    describe('tests K8sObject methods', () => {

    });

})