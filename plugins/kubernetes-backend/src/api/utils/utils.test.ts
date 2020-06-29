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
import { KubeConfig, V1ObjectMeta, V1ListMeta, V1PodStatus, V1PodSpec } from '@kubernetes/client-node';
import { Labels } from '../K8sObject/models'
import { isConfigEmpty, stringifyLabels, returnUndefinedArray, getKeysFromTypeMap, isKubeObject, decodeResultHandler, decodeKubeObject } from './utils'
import { V1PodSpecGuard } from '../Pods/typeGuards'
import { loadFixture } from './testUtils';
import { Errors } from 'io-ts';
import { right, left } from 'fp-ts/lib/Either';

const KUBE_METADATA = loadFixture('utils', 'V1ObjectMeta.json');
const POD_SPEC = loadFixture('utils', 'V1PodSpec.json');
describe('Util functions general testing', () => {
    describe('isConfigEmpty works properly', () => {
        it('isConfigEmpty returns true when KubeConfig is empty', () => {
            const emptyKubeConfigFile: KubeConfig = new KubeConfig();
            const kubeConfigWithNoValues: KubeConfig = new KubeConfig();
            kubeConfigWithNoValues.loadFromOptions({ clusters: [], users: [], contexts: [] })
            expect(isConfigEmpty(emptyKubeConfigFile) && isConfigEmpty(kubeConfigWithNoValues)).toBe(true)
        });
    });
    describe('tests stringifyLabels', () => {
        const exampleLabelString = 'app=nginx,test=new-test';
        const exampleLabels: Labels = { "app": "nginx", "test": "new-test" };
        it('returns labels in the correct format', () => {
            expect(stringifyLabels(exampleLabels)).toEqual(exampleLabelString);
        })
        it('returns empty string if empty label array', () => {
            expect(stringifyLabels({})).toEqual('');
        })
    });
    describe('tests fillUndefinedParams', () => {
        const undefinedArray: undefined[] = new Array<undefined>(4);
        it('returns an array with the correct number of undefined', () => {
            expect(returnUndefinedArray(4)).toEqual(undefinedArray);
        })
    })
    describe('tests getKeysOfKubeObject', () => {
        it('returns the correct keys', () => {
            const V1ObjectMetaKeys: Array<string> = V1ObjectMeta.getAttributeTypeMap().map(typeMap => typeMap.name);
            const V1ListMetaKeys: Array<string> = V1ListMeta.getAttributeTypeMap().map(typeMap => typeMap.name)
            expect(getKeysFromTypeMap(V1ObjectMeta.getAttributeTypeMap())).toEqual(V1ObjectMetaKeys);
            expect(getKeysFromTypeMap(V1ListMeta.getAttributeTypeMap())).toEqual(V1ListMetaKeys);
        })
    });
    describe('tests isKubeObject', () => {
        it('returns the correct boolean value', () => {
            expect(isKubeObject(KUBE_METADATA, V1ObjectMeta)).toBeTruthy();
            expect(isKubeObject(KUBE_METADATA, V1PodStatus)).toBeFalsy();
        })
    })
    describe('tests decodeResultHandler', () => {
        it('decodes an input and returns a typesafe object', () => {
            const testSpec = decodeResultHandler(POD_SPEC, V1PodSpecGuard);
            expect(testSpec).toBeInstanceOf(V1PodSpec);
        })
    })
    describe('tests decodeKubeObject', () => {
        it('decodes object and returns Either<Errors, Object>', () => {
            expect(decodeKubeObject<V1PodSpec>(POD_SPEC, V1PodSpec, [])).toStrictEqual(right(POD_SPEC))
            const errors: Errors = [{ "context": [], "message": undefined, "value": POD_SPEC }]
            expect(decodeKubeObject<V1PodStatus>(POD_SPEC, V1PodStatus, [])).toStrictEqual(left(errors))
        })
    })

})
