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
import { Pod } from './models'
import { V1Pod, V1Container } from '@kubernetes/client-node'

import {
    Labels,
    V1ObjectMeta as CustomMeta,
} from 'api/K8sObject/models';
const { body: v1Pod }: { body: V1Pod } = loadFixture('Pods', 'podResponseFixture.json');

describe(`tests model's methods work properly`, () => {
    describe(`builds pod`, () => {
        const testPod: Pod = Pod.buildFromV1PodJSON(v1Pod);
        it(" builds pod from V1Pod", () => {
            expect(typeof testPod.name).toEqual("string");
            expect(typeof testPod.kind).toEqual("string");
            expect(typeof testPod.apiVersion).toEqual("string");
            expect(CustomMeta.is(testPod.metadata)).toBe(true);
            expect(testPod.spec).toBeInstanceOf(Object);
            expect(testPod.status).toBeInstanceOf(Object);
        });
        it("Allows for null vallues", () => {
            const emptyPod: Pod = Pod.build({ name: "foo" });
            expect(emptyPod.name).toMatchInlineSnapshot(`"foo"`);
            expect(emptyPod.kind).toBeUndefined();
            expect(emptyPod.apiVersion).toBeUndefined();
            expect(emptyPod.metadata).toBeUndefined();
            expect(emptyPod.spec).toBeUndefined();
            expect(emptyPod.status).toBeUndefined();
        })
        it("builds JSON from Pod", () => {
            const testPodFromV1: Pod = Pod.buildFromV1PodJSON(v1Pod);
            expect(testPodFromV1.buildV1PodJSON()).toStrictEqual(v1Pod);
        })
        it(" Builds Pod from V1Pod with no name ", () => {
            const noNameV1Pod = v1Pod;
            if (noNameV1Pod.metadata) noNameV1Pod.metadata.name = undefined;
            expect(Pod.buildFromV1PodJSON(noNameV1Pod).name).toEqual("");
        });
    });
    describe('tests pods methods', () => {
        const testPod: Pod = Pod.buildFromV1PodJSON(v1Pod);
        it('returns list of containers', () => {
            const containersFromPod: V1Container[] | undefined = testPod.getContainers();
            if (containersFromPod)
                expect(containersFromPod[0]).toBe(v1Pod.spec?.containers[0])
            else
                throw new Error('Containers should return');
        })
    })
    describe('tests K8sObject methods', () => {
        it('gets pod labels', () => {
            const podLabels: Labels = { "app": "hello-node", "pod-template-hash": "57c6f5dbf6" };
            const testPod: Pod = Pod.buildFromV1PodJSON(v1Pod);
            expect(testPod.getLabels()).toEqual(podLabels);
        })
    })
})