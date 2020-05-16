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
import { V1Pod } from '@kubernetes/client-node'
import { Labels } from 'api/K8sObject/models';

const { body: v1Pod }: { body: V1Pod } = loadFixture('Pods', 'podResponseFixture.json');

describe(`tests model's methods work properly`, () => {
    describe(`builds pod`, () => {
        it(" builds pod from V1Pod", () => {
            const testPod: Pod = Pod.buildFromV1Pod(v1Pod);
            expect(typeof testPod.name).toEqual("string");
            expect(typeof testPod.kind).toEqual("string");
            expect(typeof testPod.apiVersion).toEqual("string");
            expect(testPod.metadata).toBeInstanceOf(Object);
            expect(testPod.spec).toBeInstanceOf(Object);
            expect(testPod.status).toBeInstanceOf(Object);
        });
        it("Allows for null vallues", () => {
            const testPod: Pod = Pod.build({ name: "foo" });
            expect(testPod.name).toMatchInlineSnapshot(`"foo"`);
            expect(testPod.kind).toBeUndefined();
            expect(testPod.apiVersion).toBeUndefined();
            expect(testPod.metadata).toBeUndefined();
            expect(testPod.spec).toBeUndefined();
            expect(testPod.status).toBeUndefined();
        })
    });

    it("builds V1Pod from Pod", () => {
        const testPod: Pod = Pod.buildFromV1Pod(v1Pod);
        expect(testPod.buildV1Pod()).toEqual(v1Pod);
    })
    it(" Builds Pod from V1Pod with no name ", () => {
        const noNameV1Pod = v1Pod;
        if (noNameV1Pod.metadata) noNameV1Pod.metadata.name = undefined;
        expect(Pod.buildFromV1Pod(noNameV1Pod).name).toEqual("");
    })
    describe('tests K8sObject methods', () => {
        it('gets pod labels', () => {
            const podLabels: Labels = { "app": "hello-node", "pod-template-hash": "57c6f5dbf6" };
            const testPod: Pod = Pod.buildFromV1Pod(v1Pod);
            expect(testPod.getLabels()).toEqual(podLabels);
        })
    })
})